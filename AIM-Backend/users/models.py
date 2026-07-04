from django.db import models
from django.contrib.auth import get_user_model
from students.models import Department

User = get_user_model()


class UserProfile(models.Model):
    ADMIN = "admin"
    DEPARTMENT = "department"

    ROLE_CHOICES = [
        (ADMIN, "Admin"),
        (DEPARTMENT, "Department"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    # Stores department_id in the database
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
