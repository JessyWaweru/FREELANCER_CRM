from rest_framework import viewsets, permissions, mixins, generics
# viewsets → A DRF shortcut that gives you list, retrieve, create, update, and delete
#  actions automatically for a model.
# generics.ListAPIView → Quick way to build read-only list endpoints (like nested routes).

from .models import Client, Project, Invoice
from .serializers import ClientSerializer, ProjectSerializer, InvoiceSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # only for Client; Project/Invoice are tied via Client
        return getattr(obj, "owner_id", None) == request.user.id
    # Purpose: Make sure only the user who owns the object can view/edit it
    # has_object_permission → Runs for requests to specific objects (like GET /clients/5/
    #  or DELETE /clients/5/).
    # getattr(obj, "owner_id", None) → Safely get the object's owner_id attribute,
    #  return None if it doesn’t exist.
    # Checks if that owner_id matches request.user.id.


class ClientViewSet(viewsets.ModelViewSet):
    # ModelViewSet → Gives you CRUD (Create, Read, Update, Delete) without writing them
    #  manually.
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    # permissions.IsAuthenticated → Only logged-in users can use it.
    # IsOwner → On top of being logged in, you must own the client record.

    def get_queryset(self):
        # Limits query results to only the logged-in user’s clients.
        # Orders newest first.
        return Client.objects.filter(owner=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
        # Saves the client with the logged-in user as the owner.


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # A project must belong to a client whose owner is the logged-in user.
        # client__owner is Django ORM’s way of filtering across relationships.
        qs = (
            Project.objects
            .select_related("client")  # select_related → avoid extra queries when accessing client
            .filter(client__owner=self.request.user)
        )

        # Optional filter: /api/projects?client=<id>
        # Lets the UI ask for a specific client's projects without needing a nested route.
        client_id = self.request.query_params.get("client")
        if client_id:
            qs = qs.filter(client_id=client_id)

        return qs


class ClientProjectsList(generics.ListAPIView):
    """
    Read-only nested endpoint for a single client's projects:
      GET /api/clients/<client_id>/projects/

    Why this exists even with the query-param option:
      - Clean, discoverable URL when you navigate from a client detail.
      - Keeps backend flexible: both /projects?client=<id> and nested route work.
    """
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        client_id = self.kwargs["client_id"]
        # Security: still ensure the client belongs to the requesting user.
        # select_related("client") → include client row in the same query for performance
        return (
            Project.objects
            .select_related("client")
            .filter(client_id=client_id, client__owner=self.request.user)
        )


class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only invoices whose client belongs to the logged-in user.
        return Invoice.objects.filter(client__owner=self.request.user)

