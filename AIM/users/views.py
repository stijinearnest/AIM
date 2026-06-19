from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics
from .serializers import RegisterSerializer


class RegisterUser(generics.CreateAPIView):
    serializer_class = RegisterSerializer


class Login(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {"error": "Invalid username or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        profile = getattr(user, "userprofile", None)

        return Response(
            {
                "message": "Login successful",
                "user_id": user.id,
                "department_id": profile.department_id if profile else None,
                "role": profile.role if profile else None,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                
            },
            status=status.HTTP_200_OK,
        )
