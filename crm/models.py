from django.db import models
from django.contrib.auth import get_user_model
#get_user_model() → Returns the active User model.

User = get_user_model()

class Client(models.Model):
    #You’re creating a Python class (Client) that inherits from models.Model.
    #This inheritance is what gives your class all the database superpowers.
    #Each class you create that inherits from models.Model becomes a table in your database.
    #Each attribute inside the class (like name, email, etc.) becomes a column in that table.
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="clients")
    #ForeignKey(User) → Links the client to the user who owns them (like the freelancer).
    #on_delete=models.CASCADE → If the user is deleted, all their clients will also be 
    # deleted.
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    #blank=True means the field can be left empty in forms.
    phone = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Project(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="projects")
    title = models.CharField(max_length=200)
    status = models.CharField(max_length=30, default="active")  # active/completed/on-hold
    notes = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)

class Invoice(models.Model):
    DRAFT, SENT, PAID, OVERDUE = "draft", "sent", "paid", "overdue"
    STATUS_CHOICES = [(DRAFT,"Draft"),(SENT,"Sent"),(PAID,"Paid"),(OVERDUE,"Overdue")]
#Constants for invoice status — helps avoid typos and makes filtering easier.
#STATUS_CHOICES → Restricts status field to one of these four values.
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="invoices")
    number = models.CharField(max_length=30, unique=True)
    #Invoice number must be unique (e.g., INV-2025-001).
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=DRAFT)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
