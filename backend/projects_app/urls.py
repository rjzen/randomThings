from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CollectionViewSet, TagViewSet, ProjectViewSet

router = DefaultRouter()
router.register(r'collections', CollectionViewSet, basename='collection')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'projects', ProjectViewSet, basename='project')

urlpatterns = [
    path('', include(router.urls)),
]
