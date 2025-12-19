from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework import serializers, generics, permissions, status
from rest_framework.response import Response

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Default User REQUIRES username. Email is optional but recommended.
        fields = ("username",  "password")
        extra_kwargs = {"password": {"write_only": True}}

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    
    def create(self, validated_data):
        try:
            # Uses Django's built-in hashing via create_user
            return User.objects.create_user(**validated_data)
        except TypeError as e:
            # e.g., missing username in payload
            raise serializers.ValidationError({"detail": f"Invalid fields: {e}"})
        except IntegrityError:
            raise serializers.ValidationError({"detail": "User already exists."})

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer
    authentication_classes = []  # 🔥 THIS FIXES 401 ON RENDER

    # Optional: strip password from response and standardize status
    def create(self, request, *args, **kwargs):
        resp = super().create(request, *args, **kwargs)
        data = dict(resp.data)
        data.pop("password", None)
        return Response(data, status=status.HTTP_201_CREATED)
