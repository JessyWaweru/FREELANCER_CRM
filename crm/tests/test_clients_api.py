# crm/tests/test_clients_api.py
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from crm.models import Client

User = get_user_model()

@pytest.mark.django_db
def test_get_clients_list():
    client = APIClient()

    # Arrange – create sample user and client
    user = User.objects.create_user(username="testuser", password="pass1234")
    Client.objects.create(owner=user, name="John Doe", email="john@example.com")

    # Authenticate
    client.force_authenticate(user=user)

    # Act
    response = client.get("/api/clients/")

    # Assert
    assert response.status_code == 200
    assert any(item["name"] == "John Doe" for item in response.data)

@pytest.mark.django_db
def test_create_client():
    client = APIClient()

    # Create and authenticate a user
    user = User.objects.create_user(username="testuser", password="pass1234")
    client.force_authenticate(user=user)

    payload = {
        "name": "New Client",
        "email": "newclient@example.com",
         "phone": "0712345678",
    }

    url = "/api/clients/"
    response = client.post(url, payload, format="json")

    print(response.data)  # 👈 This will show exactly why it's failing
    assert response.status_code == 201
    assert response.data["name"] == "New Client"