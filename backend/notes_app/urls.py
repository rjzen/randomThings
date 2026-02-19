from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'folders', views.FolderViewSet, basename='folder')
router.register(r'tags', views.TagViewSet, basename='tag')
router.register(r'notes', views.NoteViewSet, basename='note')
router.register(r'note-images', views.NoteImageViewSet, basename='noteimage')

urlpatterns = [
    path('', include(router.urls)),
]
