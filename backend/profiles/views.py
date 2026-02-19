from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import UserProfile, Theme, Activity
from .serializers import UserProfileSerializer, ThemeSerializer, ActivitySerializer

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        # Create activity on first profile access
        if created:
            Activity.objects.create(
                user=request.user,
                action='profile_created',
                description=f'Profile created for {request.user.username}',
                metadata={'username': request.user.username}
            )
        
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
        
        # Track avatar change
        avatar_changed = 'avatar' in request.data and request.data.get('avatar') not in [None, '', profile.avatar]
        
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            
            # Update user info directly from request data
            if 'first_name' in request.data:
                request.user.first_name = request.data['first_name']
            if 'last_name' in request.data:
                request.user.last_name = request.data['last_name']
            if 'email' in request.data:
                request.user.email = request.data['email']
            request.user.save()
            
            # Log activity
            if avatar_changed:
                Activity.objects.create(
                    user=request.user,
                    action='avatar_updated',
                    description=f'User updated their profile picture',
                    metadata={'username': request.user.username}
                )
            else:
                Activity.objects.create(
                    user=request.user,
                    action='profile_updated',
                    description=f'User updated their profile information',
                    metadata={'username': request.user.username}
                )
            
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
            theme = serializer.save()
            Activity.objects.create(
                user=request.user,
                action='theme_created',
                description=f'Created new theme: {theme.name}',
                metadata={'theme_name': theme.name, 'theme_id': theme.id}
            )
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
        theme_name = theme.name
        theme.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class SetThemeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        theme_id = request.data.get('theme_id')
        if not theme_id:
            return Response({'error': 'theme_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        old_theme_name = profile.current_theme.name if profile.current_theme else 'Default'
        
        try:
            theme = Theme.objects.get(pk=theme_id)
            profile.current_theme = theme
            profile.save()
            
            Activity.objects.create(
                user=request.user,
                action='theme_changed',
                description=f'Changed theme from {old_theme_name} to {theme.name}',
                metadata={'old_theme': old_theme_name, 'new_theme': theme.name}
            )
            
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except Theme.DoesNotExist:
            return Response({'error': 'Theme not found'}, status=status.HTTP_404_NOT_FOUND)

class ActivityListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        limit = request.query_params.get('limit', 10)
        try:
            limit = int(limit)
        except ValueError:
            limit = 10
        
        activities = Activity.objects.all()[:limit]
        serializer = ActivitySerializer(activities, many=True)
        return Response(serializer.data)
