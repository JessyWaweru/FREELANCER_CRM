"""
URL configuration for crm_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
#Brings in Django’s built-in admin site so you can manage models in the browser.
from django.urls import path, include
#path → used to define URL patterns.
#include → allows you to reference other URL configuration files instead of putting 
# everything in one file.
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# Token views for JWT authentication
# TokenObtainPairView: lets a user log in by sending their username & password, and
#  receive an access token + refresh token.
# TokenRefreshView: takes a refresh token and returns a new access token 
# (so the user doesn’t need to log in again when the access token expires).
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("crm.urls")),   # we'll create this
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

