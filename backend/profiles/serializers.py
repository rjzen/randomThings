from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Theme, Activity

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class ThemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Theme
        fields = '__all__'

class ActivitySerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Activity
        fields = ['id', 'user', 'user_username', 'action', 'description', 'metadata', 'created_at']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_info = UserSerializer(source='user', write_only=True, required=False)
    current_theme = ThemeSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = '__all__'
    
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user_info', None)
        
        # Update user fields if provided
        if user_data:
            user = instance.user
            if 'first_name' in user_data:
                user.first_name = user_data['first_name']
            if 'last_name' in user_data:
                user.last_name = user_data['last_name']
            if 'email' in user_data:
                user.email = user_data['email']
            user.save()
        
        # Update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance