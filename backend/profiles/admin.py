from django.contrib import admin
from .models import Theme, UserProfile, Activity  # Replace with your actual models

admin.site.register(Theme)
admin.site.register(UserProfile)
admin.site.register(Activity)