#Enables full CRUD over your models through API calls.
from rest_framework import serializers
from .models import Client, Project, Invoice
from django.contrib.auth import get_user_model


User = get_user_model()



   

class ClientSerializer(serializers.ModelSerializer):
    #serializers.ModelSerializer → A DRF shortcut that creates serializer fields based
    #  on your model fields automatically.
    class Meta:
        # Meta is Django’s convention for passing model-related settings to a
        #  class — it keeps things clean and readable.
        model = Client
        fields = "__all__"
        #fields = "__all__" → Include all fields from the model in the serializer output.
        read_only_fields = ("owner","created_at")

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = "__all__"

