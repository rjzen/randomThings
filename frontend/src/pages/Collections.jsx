import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { projectsAPI } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { Toaster, toast } from 'react-hot-toast';
import {
  FolderIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const PRESET_COLORS = [
  '#6366f1', '#ef4444', '#22c55e', '#f59e0b',
  '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16'
];

const Collections = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentTheme } = useTheme();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: '#6366f1' });
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  useEffect(() => { fetchCollections(); }, [searchQuery]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const params = searchQuery ? { search: searchQuery } : {};
      const data = await projectsAPI.getCollections(params);
      setCollections(data);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCollection) {
        await projectsAPI.updateCollection(editingCollection.id, formData);
        toast.success('Collection updated');
      } else {
        await projectsAPI.createCollection(formData);
        toast.success('Collection created');
      }
      setShowModal(false);
      setEditingCollection(null);
      setFormData({ name: '', description: '', color: '#6366f1' });
      fetchCollections();
    } catch (error) {
      toast.error('Failed to save collection');
    }
  };

  const handleDelete = async (id) => {
    try {
      await projectsAPI.deleteCollection(id);
      toast.success('Collection deleted');
      setShowDeleteModal(null);
      fetchCollections();
    } catch (error) {
      toast.error('Failed to delete collection');
    }
  };

  const openEdit = (collection) => {
    setEditingCollection(collection);
    setFormData({ name: collection.name, description: collection.description || '', color: collection.color });
    setShowModal(true);
  };

  const navigateToProjects = (collectionId) => {
    navigate(`/projects?collection=${collectionId}`);
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
          <p className="text-gray-600 mt-2">Organize your projects into collections.</p>
        </div>
        <button
          onClick={() => { setEditingCollection(null); setFormData({ name: '', description: '', color: '#6366f1' }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
          style={{ backgroundColor: currentTheme.primary_color }}
        >
          <PlusIcon className="h-5 w-5" />
          New Collection
        </button>
      </div>

      <div className="relative">
        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search collections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': currentTheme.primary_color }}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12">
          <FolderIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">No collections yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: currentTheme.primary_color }}
          >
            Create your first collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map(collection => (
            <div
              key={collection.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigateToProjects(collection.id)}
            >
              <div className="h-2" style={{ backgroundColor: collection.color }} />
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{collection.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{collection.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(collection); }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDeleteModal(collection.id); }}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {collection.project_count} Projects
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCollection ? 'Edit Collection' : 'New Collection'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': currentTheme.primary_color }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': currentTheme.primary_color }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex gap-2">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                        formData.color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: currentTheme.primary_color }}
                >
                  {editingCollection ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Collection?</h3>
            <p className="text-gray-500 mb-4">This will not delete the projects in this collection.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;
