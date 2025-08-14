# crm/api_views.py
from rest_framework import viewsets, permissions,mixins 
#viewsets → A DRF shortcut that gives you list, retrieve, create, update, and delete
#  actions automatically for a model.
from .models import Client, Project, Invoice
from .serializers import ClientSerializer, ProjectSerializer, InvoiceSerializer, RegisterSerializer
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny


User = get_user_model()

class RegisterViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # only for Client; Project/Invoice are tied via Client
        return getattr(obj, "owner_id", None) == request.user.id
    #Purpose: Make sure only the user who owns the object can view/edit it 
    # has_object_permission → Runs for requests to specific objects (like GET /clients/5/
    #  or DELETE /clients/5/).
    # getattr(obj, "owner_id", None) → Safely get the object's owner_id attribute,
    #  return None if it doesn’t exist.
    # Checks if that owner_id matches request.user.id.

class ClientViewSet(viewsets.ModelViewSet):
    #ModelViewSet → Gives you CRUD (Create, Read, Update, Delete) without writing them
    #  manually.
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    #permissions.IsAuthenticated → Only logged-in users can use it.

    # IsOwner → On top of being logged in, you must own the client record.
    def get_queryset(self):
        return Client.objects.filter(owner=self.request.user).order_by("-created_at")
    #Limits query results to only the logged-in user’s clients.
    # Orders newest first.


    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
        # Saves the client with the logged-in user as the owner.

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(client__owner=self.request.user)
        # A project must belong to a client whose owner is the logged-in user.
        # client__owner is Django ORM’s way of filtering across relationships.

class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Invoice.objects.filter(client__owner=self.request.user)
