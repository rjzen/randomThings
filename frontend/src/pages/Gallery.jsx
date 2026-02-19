import React, { useState, useEffect, useRef } from 'react';
import { galleryAPI } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import {
  PlusIcon,
  TrashIcon,
  ViewColumnsIcon,
  ArrowsPointingOutIcon,
  DocumentMagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  PencilIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

const Gallery = () => {
  const { currentTheme } = useTheme();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('gallery');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const data = await galleryAPI.getPhotos();
      setPhotos(data);
      setError(null);
    } catch (err) {
      setError('Failed to load photos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      
      const newPhoto = await galleryAPI.uploadPhoto(formData);
      setPhotos([newPhoto, ...photos]);
    } catch (err) {
      setError('Failed to upload photo');
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    
    try {
      await galleryAPI.deletePhoto(photoId);
      setPhotos(photos.filter(p => p.id !== photoId));
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto(null);
      }
      if (carouselIndex >= photos.length - 1) {
        setCarouselIndex(Math.max(0, photos.length - 2));
      }
    } catch (err) {
      setError('Failed to delete photo');
      console.error(err);
    }
  };

  const handleUpdatePhoto = async (photoId) => {
    try {
      const updated = await galleryAPI.updatePhoto(photoId, editForm);
      setPhotos(photos.map(p => p.id === photoId ? updated : p));
      setEditingPhoto(null);
      setEditForm({ title: '', description: '' });
    } catch (err) {
      setError('Failed to update photo');
      console.error(err);
    }
  };

  const startEditing = (photo) => {
    setEditingPhoto(photo.id);
    setEditForm({ title: photo.title || '', description: photo.description || '' });
  };

  const nextCarousel = () => {
    if (photos.length > 0) {
      setCarouselIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevCarousel = () => {
    if (photos.length > 0) {
      setCarouselIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const renderGalleryView = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="relative group aspect-square overflow-hidden rounded-lg cursor-pointer shadow-md hover:shadow-lg transition-shadow"
          onClick={() => setSelectedPhoto(photo)}
        >
          <img
            src={photo.image_url}
            alt={photo.title || 'Gallery photo'}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            <p className="text-white text-sm font-medium truncate">
              {photo.title || 'Untitled'}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(photo);
                }}
                className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <PencilIcon className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePhoto(photo.id);
                }}
                className="p-1.5 bg-red-500/80 rounded-full hover:bg-red-600 transition-colors"
              >
                <TrashIcon className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCarouselView = () => (
    <div className="relative w-full h-[60vh] bg-gray-900 rounded-lg overflow-hidden">
      {photos.length > 0 ? (
        <>
          <img
            src={photos[carouselIndex]?.image_url}
            alt={photos[carouselIndex]?.title || 'Carousel photo'}
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <h3 className="text-white text-xl font-semibold">
              {photos[carouselIndex]?.title || 'Untitled'}
            </h3>
            {photos[carouselIndex]?.description && (
              <p className="text-gray-300 mt-1">{photos[carouselIndex].description}</p>
            )}
            <p className="text-gray-400 text-sm mt-2">
              {carouselIndex + 1} / {photos.length}
            </p>
          </div>
          <button
            onClick={prevCarousel}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          >
            <ChevronLeftIcon className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={nextCarousel}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          >
            <ChevronRightIcon className="h-6 w-6 text-white" />
          </button>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">No photos to display</p>
        </div>
      )}
    </div>
  );

  const renderDetailsView = () => (
    <div className="grid grid-cols-1 gap-6">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <img
                src={photo.image_url}
                alt={photo.title || 'Gallery photo'}
                className="w-full h-64 md:h-auto object-cover"
              />
            </div>
            <div className="p-4 md:w-1/2 flex flex-col">
              {editingPhoto === photo.id ? (
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Title"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Description"
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdatePhoto(photo.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <CheckIcon className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingPhoto(null)}
                      className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {photo.title || 'Untitled'}
                  </h3>
                  {photo.description && (
                    <p className="text-gray-600 mt-2">{photo.description}</p>
                  )}
                  <p className="text-gray-400 text-sm mt-auto pt-4">
                    Added: {new Date(photo.created_at).toLocaleDateString()}
                  </p>
                </>
              )}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                {editingPhoto !== photo.id && (
                  <>
                    <button
                      onClick={() => startEditing(photo)}
                      className="flex items-center gap-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
          <p className="text-gray-600 mt-2">Manage your hobby photos and images.</p>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ViewColumnsIcon className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div
          className={`
            fixed lg:fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-64'}
            lg:relative lg:transform-none rounded-lg
          `}
          style={{ top: '1rem', height: 'calc(100vh - 8rem)' }}
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between lg:hidden">
            <h2 className="text-lg font-semibold">Gallery Menu</h2>
            <button onClick={() => setIsSidebarOpen(false)}>
              <XMarkIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          
          <div className="p-4 space-y-6 overflow-y-auto h-full">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Add Photos
              </h3>
              <label
                className={`
                  flex flex-col items-center justify-center w-full h-32 
                  border-2 border-dashed rounded-lg cursor-pointer 
                  hover:bg-gray-50 transition-colors
                  ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                style={{ borderColor: currentTheme.primary_color }}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <PlusIcon className="h-8 w-8 mb-2" style={{ color: currentTheme.primary_color }} />
                  <p className="text-sm text-gray-500">
                    {isUploading ? 'Uploading...' : 'Click to add photos'}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
              </label>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                View Mode
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setViewMode('gallery')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'gallery' ? 'text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={viewMode === 'gallery' ? { backgroundColor: currentTheme.primary_color } : {}}
                >
                  <ViewColumnsIcon className="h-5 w-5" />
                  Gallery
                </button>
                <button
                  onClick={() => setViewMode('carousel')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'carousel' ? 'text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={viewMode === 'carousel' ? { backgroundColor: currentTheme.primary_color } : {}}
                >
                  <ArrowsPointingOutIcon className="h-5 w-5" />
                  Carousel
                </button>
                <button
                  onClick={() => setViewMode('details')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'details' ? 'text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={viewMode === 'details' ? { backgroundColor: currentTheme.primary_color } : {}}
                >
                  <DocumentMagnifyingGlassIcon className="h-5 w-5" />
                  Details
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                {photos.length} photo{photos.length !== 1 ? 's' : ''} in gallery
              </p>
            </div>
          </div>
        </div>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: currentTheme.primary_color }}></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          ) : photos.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <PlusIcon className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No photos yet</h3>
              <p className="text-gray-500 mt-1">Click the button in the sidebar to add your first photo.</p>
            </div>
          ) : (
            <>
              {viewMode === 'gallery' && renderGalleryView()}
              {viewMode === 'carousel' && renderCarouselView()}
              {viewMode === 'details' && renderDetailsView()}
            </>
          )}
        </div>
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            onClick={() => setSelectedPhoto(null)}
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
          <img
            src={selectedPhoto.image_url}
            alt={selectedPhoto.title || 'Full size'}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Gallery;
