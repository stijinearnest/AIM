from django.contrib.auth import get_user_model
from rest_framework import serializers

from students.models import Department

from .models import UserProfile

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    department = serializers.CharField(write_only=True)

    def create(self, validated_data):
        department_name = validated_data.pop("department")

        departments = Department.objects.filter(department__iexact=department_name)
        department = departments.first()
        if department is None:
            raise serializers.ValidationError(
                {"department": "Department does not exist."}
            )
        if departments.count() > 1:
            raise serializers.ValidationError(
                {"department": "Multiple departments match this name."}
            )

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )

        UserProfile.objects.create(
            user=user,
            role=UserProfile.DEPARTMENT,
            department=department,
        )

        return user
