from django.shortcuts import render
from rest_framework import viewsets
from .models import Client, Project, Invoice
from .serializers import ClientSerializer, ProjectSerializer, InvoiceSerializer
#viewsets.ModelViewSet gives full CRUD functionality (GET, POST, PUT, DELETE)
#  without writing those methods manually.
class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

# Create your views here.
