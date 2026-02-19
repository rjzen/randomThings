from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Theme(models.Model):
    name = models.CharField(max_length=100, unique=True)
    primary_color = models.CharField(max_length=7, default='#6366f1')  # Indigo
    secondary_color = models.CharField(max_length=7, default='#8b5cf6')  # Purple
    background_color = models.CharField(max_length=7, default='#f9fafb')  # Light gray
    text_color = models.CharField(max_length=7, default='#111827')  # Dark gray
    sidebar_color = models.CharField(max_length=7, default='#1f2937')  # Dark gray for sidebar
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postcode = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(blank=True, null=True)
    national_id = models.CharField(max_length=50, blank=True)
    title = models.CharField(max_length=50, blank=True)
    hire_date = models.DateField(blank=True, null=True)
    theme = models.ForeignKey(Theme, on_delete=models.SET_NULL, null=True, blank=True, related_name='user_profiles')
    current_theme = models.ForeignKey(Theme, on_delete=models.SET_NULL, null=True, blank=True, related_name='current_for_profiles')
    about = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username}'s Profile"

class Activity(models.Model):
    ACTION_CHOICES = [
        ('theme_created', 'Theme Created'),
        ('theme_changed', 'Theme Changed'),
        ('profile_updated', 'Profile Updated'),
        ('profile_created', 'Profile Created'),
        ('avatar_updated', 'Avatar Updated'),
        ('photo_uploaded', 'Photo Uploaded'),
        ('photo_updated', 'Photo Updated'),
        ('photo_deleted', 'Photo Deleted'),
        ('task_created', 'Task Created'),
        ('task_deleted', 'Task Deleted'),
        ('note_created', 'Note Created'),
        ('note_deleted', 'Note Deleted'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.action} - {self.created_at}"
