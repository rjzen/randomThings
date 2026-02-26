from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HabitViewSet, GamificationView, AchievementsView

router = DefaultRouter()
router.register('', HabitViewSet, basename='habit')

urlpatterns = [
    path('gamification/', GamificationView.as_view(), name='gamification'),
    path('achievements/', AchievementsView.as_view(), name='achievements'),
    path('', include(router.urls)),
]
