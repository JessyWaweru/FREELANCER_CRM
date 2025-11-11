import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


# ✅ SIGNUP TESTS
@pytest.mark.django_db
def test_user_signup_success():
    client = APIClient()

    payload = {
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "pass1234",
    }

    url = reverse("register")
    response = client.post(url, payload, format="json")

    assert response.status_code == 201
    assert User.objects.filter(username="newuser").exists()


@pytest.mark.django_db
def test_user_signup_duplicate_username():
    User.objects.create_user(username="newuser", password="pass1234")

    client = APIClient()
    payload = {
        "username": "newuser",
        "email": "another@example.com",
        "password": "pass1234",
    }

    url = reverse("register")
    response = client.post(url, payload, format="json")

    assert response.status_code in [400, 409]


@pytest.mark.django_db
def test_user_signup_missing_fields():
    client = APIClient()
    payload = {
        "username": "",
        "password": "",
    }

    url = reverse("register")
    response = client.post(url, payload, format="json")

    assert response.status_code in [400, 422]


# ✅ LOGIN TESTS (JWT)
@pytest.mark.django_db
def test_user_login_success():
    # Create user in DB
    User.objects.create_user(username="loginuser", password="pass1234")

    client = APIClient()
    payload = {
        "username": "loginuser",
        "password": "pass1234",
    }

    url = reverse("token_obtain_pair")
    response = client.post(url, payload, format="json")

    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data


@pytest.mark.django_db
def test_user_login_wrong_credentials():
    User.objects.create_user(username="loginuser", password="pass1234")

    client = APIClient()
    payload = {
        "username": "loginuser",
        "password": "wrongpass",
    }

    url = reverse("token_obtain_pair")
    response = client.post(url, payload, format="json")

    assert response.status_code in [400, 401]


@pytest.mark.django_db
def test_token_refresh():
    # Step 1 — login to obtain refresh token
    User.objects.create_user(username="refreshuser", password="pass1234")

    client = APIClient()
    login_payload = {
        "username": "refreshuser",
        "password": "pass1234",
    }
    login_url = reverse("token_obtain_pair")
    login_resp = client.post(login_url, login_payload, format="json")

    assert login_resp.status_code == 200
    refresh_token = login_resp.data["refresh"]

    # Step 2 — refresh token
    refresh_payload = {"refresh": refresh_token}
    refresh_url = reverse("token_refresh")
    refresh_resp = client.post(refresh_url, refresh_payload, format="json")

    assert refresh_resp.status_code == 200
    assert "access" in refresh_resp.data
