from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('themes/', views.ThemeListView.as_view(), name='theme_list'),
    path('themes/<int:pk>/', views.ThemeDetailView.as_view(), name='theme_detail'),
    path('set-theme/', views.SetThemeView.as_view(), name='set_theme'),
    path('activities/', views.ActivityListView.as_view(), name='activity_list'),
]