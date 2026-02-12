from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import UserProfile, Theme
from .serializers import UserProfileSerializer, ThemeSerializer

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        
        # Include user info directly in response
        data = serializer.data
        user_data = {
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
        }
        data['user_info'] = user_data
        
        return Response(data)

    def put(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            
            # Update user info if provided
            user_data = request.data.get('user_info', {})
            if user_data:
                if 'first_name' in user_data:
                    request.user.first_name = user_data['first_name']
                if 'last_name' in user_data:
                    request.user.last_name = user_data['last_name']
                if 'email' in user_data:
                    request.user.email = user_data['email']
                request.user.save()
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ThemeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        themes = Theme.objects.all()
        serializer = ThemeSerializer(themes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ThemeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ThemeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        theme = get_object_or_404(Theme, pk=pk)
        serializer = ThemeSerializer(theme)
        return Response(serializer.data)

    def put(self, request, pk):
        theme = get_object_or_404(Theme, pk=pk)
        serializer = ThemeSerializer(theme, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        theme = get_object_or_404(Theme, pk=pk)
        theme.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
