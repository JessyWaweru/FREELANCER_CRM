from django.urls import path, include
from rest_framework.routers import DefaultRouter
# DefaultRouter is a Django REST Framework helper that automatically generates routes
# for your ViewSets.
# Without it, you’d have to manually write all the paths for list, 
# retrieve, create, update, and delete.
from .views import ClientViewSet, ProjectViewSet, HealthCheckView
from .register import RegisterView
# ✅ API router
router = DefaultRouter()
router.register(r"clients", ClientViewSet, basename="client")
router.register(r"projects", ProjectViewSet, basename="project")

urlpatterns = [
    # API endpoints
    path("", include(router.urls)),
    path("register/", RegisterView.as_view(), name="register"),

    # Health check endpoint for uptime ping
   path("health/", HealthCheckView.as_view()),

]
