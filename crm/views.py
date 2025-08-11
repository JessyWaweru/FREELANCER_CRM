from django.shortcuts import render
from rest_framework import viewsets
from .models import Client, Project, Invoice
from .serializers import ClientSerializer, ProjectSerializer, InvoiceSerializer
from rest_framework.permissions import IsAuthenticated
#viewsets.ModelViewSet gives full CRUD functionality (GET, POST, PUT, DELETE)
#  without writing those methods manually.
class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users can access

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users can access

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users can access

# Create your views here.
