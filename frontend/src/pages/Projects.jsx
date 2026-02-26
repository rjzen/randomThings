import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { projectsAPI } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { Toaster, toast } from 'react-hot-toast';
import {
  FolderIcon,
  TagIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  StarIcon,
  LinkIcon,
  EllipsisVerticalIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  on_hold: 'bg-yellow-100 text-yellow-700',
};

const STATUS_LABELS = {
  active: 'Active',
  completed: 'Completed',
  on_hold: 'On Hold',
};

const PRESET_COLORS = [
  '#6366f1', '#ef4444', '#22c55e', '#f59e0b',
  '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16'
];

const Projects = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  
  const [projects, setProjects] = useState([]);
  const [pinnedProjects, setPinnedProjects] = useState([]);
  const [collections, setCollections] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState('all');
  const [selectedCollection, setSelectedCollection] = useState(searchParams.get('collection') || null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showSidebar, setShowSidebar] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', description: '', url: '', collection: '',
    tags: [], status: 'active', due_date: '', progress: 0, is_pinned: false
  });

  useEffect(() => { fetchData(); }, [view, selectedCollection, selectedTag, statusFilter, searchQuery]);

  useEffect(() => {
    const coll = searchParams.get('collection');
    if (coll) setSelectedCollection(coll);
  }, [searchParams]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCollection) params.collection = selectedCollection;
      if (selectedTag) params.tag = selectedTag;
      if (statusFilter) params.status = statusFilter;
      if (view === 'pinned') params.pinned = 'true';

      const [collectionsData, tagsData, projectsData, pinnedData] = await Promise.all([
        projectsAPI.getCollections(),
        projectsAPI.getTags(),
        projectsAPI.getProjects(params),
        projectsAPI.getProjects({ pinned: 'true' })
      ]);
      setCollections(collectionsData);
      setTags(tagsData);
      setProjects(projectsData);
      setPinnedProjects(pinnedData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData };
      if (!data.collection) delete data.collection;
      
      if (editingProject) {
        await projectsAPI.updateProject(editingProject.id, data);
        toast.success('Project updated');
      } else {
        await projectsAPI.createProject(data);
        toast.success('Project created');
      }
      setShowModal(false);
      setEditingProject(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Failed to save project');
    }
  };

  const handleDelete = async (id) => {
    try {
      await projectsAPI.deleteProject(id);
      toast.success('Project deleted');
      setShowDeleteModal(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handlePin = async (id) => {
    try {
      await projectsAPI.pinProject(id);
      fetchData();
    } catch (error) {
      toast.error('Failed to pin project');
    }
  };

  const handleProgress = async (id, progress) => {
    try {
      await projectsAPI.updateProgress(id, progress);
      if (progress >= 100) {
        toast.success('Project marked as completed!');
      }
      fetchData();
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', url: '', collection: '',
      tags: [], status: 'active', due_date: '', progress: 0, is_pinned: false
    });
  };

  const openEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      url: project.url || '',
      collection: project.collection || '',
      tags: project.tags?.map(t => t.id) || [],
      status: project.status,
      due_date: project.due_date || '',
      progress: project.progress,
      is_pinned: project.is_pinned
    });
    setShowModal(true);
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date(new Date().toDateString());
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const navigateToCollection = (collectionId) => {
    navigate(`/collections?highlight=${collectionId}`);
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Track and manage your ongoing projects.</p>
        </div>
        <button
          onClick={() => { setEditingProject(null); resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
          style={{ backgroundColor: currentTheme.primary_color }}
        >
          <PlusIcon className="h-5 w-5" />
          New Project
        </button>
      </div>

      <div className="flex h-[calc(100vh-14rem)] bg-white rounded-xl shadow-sm border">
        {/* Sidebar */}
        <div className={`${showSidebar ? 'w-64' : 'w-0'} transition-all duration-300 border-r overflow-hidden flex flex-col`}>
          <div className="p-3 border-b">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': currentTheme.primary_color }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            <button
              onClick={() => { setView('all'); setSelectedCollection(null); setSelectedTag(null); setStatusFilter(null); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${view === 'all' && !selectedCollection ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              All Projects
            </button>
            <button
              onClick={() => { setView('pinned'); setSelectedCollection(null); setSelectedTag(null); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${view === 'pinned' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <StarIcon className="h-4 w-4" />
              Pinned
            </button>

            {/* Collections */}
            <div>
              <div className="px-3 py-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Collections</span>
              </div>
              {collections.map(collection => (
                <button
                  key={collection.id}
                  onClick={() => { setSelectedCollection(collection.id); setView('all'); setSelectedTag(null); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${selectedCollection === collection.id ? 'bg-indigo-50' : 'hover:bg-gray-100'}`}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: collection.color }} />
                  <span className="truncate">{collection.name}</span>
                  <span className="ml-auto text-xs text-gray-400">{collection.project_count}</span>
                </button>
              ))}
            </div>

            {/* Tags */}
            <div>
              <div className="px-3 py-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Tags</span>
              </div>
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => { setSelectedTag(tag.id); setView('all'); setSelectedCollection(null); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${selectedTag === tag.id ? 'bg-indigo-50' : 'hover:bg-gray-100'}`}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                  <span>{tag.name}</span>
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div>
              <div className="px-3 py-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
              </div>
              <div className="px-3 space-y-1">
                {[null, 'active', 'completed', 'on_hold'].map(status => (
                  <button
                    key={status || 'all'}
                    onClick={() => { setStatusFilter(status); setView('all'); }}
                    className={`w-full text-left px-2 py-1 rounded text-sm ${statusFilter === status ? 'text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {status ? STATUS_LABELS[status] : 'All'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-3 border-b bg-white lg:hidden">
            <button onClick={() => setShowSidebar(!showSidebar)} className="p-1">
              <FolderIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Pinned Projects */}
            {view === 'all' && pinnedProjects.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                  <StarIcon className="h-4 w-4 text-yellow-500" />
                  Pinned Projects
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {pinnedProjects.map(project => (
                    <div
                      key={project.id}
                      className="flex-shrink-0 w-72 bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ring-2 ring-yellow-400"
                    >
                      <div className="h-1" style={{ backgroundColor: project.collection_color || '#9ca3af' }} />
                      <div className="p-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-gray-900 truncate">{project.title}</h4>
                          <div className="relative">
                            <button onClick={() => setOpenMenu(openMenu === project.id ? null : project.id)} className="p-1">
                              <EllipsisVerticalIcon className="h-4 w-4 text-gray-400" />
                            </button>
                            {openMenu === project.id && (
                              <div className="absolute right-0 top-6 bg-white shadow-lg rounded-lg py-1 z-10 min-w-[120px]">
                                <button onClick={() => { openEdit(project); setOpenMenu(null); }} className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100">Edit</button>
                                <button onClick={() => { handlePin(project.id); setOpenMenu(null); }} className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100">Unpin</button>
                                <button onClick={() => { setShowDeleteModal(project.id); setOpenMenu(null); }} className="w-full px-3 py-1 text-left text-sm text-red-600 hover:bg-gray-100">Delete</button>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{project.description || 'No description'}</p>
                        <div className="mt-2">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${project.progress}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{project.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Grid */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No projects found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                  <div
                    key={project.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="h-1" style={{ backgroundColor: project.collection_color || '#9ca3af' }} />
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {project.is_pinned && <StarIcon className="h-4 w-4 text-yellow-500" />}
                            <h3 className="font-semibold text-gray-900 truncate">{project.title}</h3>
                          </div>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description || 'No description'}</p>
                        </div>
                        <div className="relative ml-2">
                          <button onClick={() => setOpenMenu(openMenu === project.id ? null : project.id)} className="p-1">
                            <EllipsisVerticalIcon className="h-4 w-4 text-gray-400" />
                          </button>
                          {openMenu === project.id && (
                            <div className="absolute right-0 top-6 bg-white shadow-lg rounded-lg py-1 z-10 min-w-[120px]">
                              <button onClick={() => { openEdit(project); setOpenMenu(null); }} className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100">Edit</button>
                              <button onClick={() => { handlePin(project.id); setOpenMenu(null); }} className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100">
                                {project.is_pinned ? 'Unpin' : 'Pin'}
                              </button>
                              <button onClick={() => { setShowDeleteModal(project.id); setOpenMenu(null); }} className="w-full px-3 py-1 text-left text-sm text-red-600 hover:bg-gray-100">Delete</button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        {project.collection_name && (
                          <button
                            onClick={() => navigateToCollection(project.collection)}
                            className="text-xs px-2 py-0.5 rounded flex items-center gap-1 bg-gray-100 hover:bg-gray-200"
                          >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.collection_color }} />
                            {project.collection_name}
                          </button>
                        )}
                        {project.tags_data?.slice(0, 2).map(tag => (
                          <span key={tag.id} className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: tag.color }}>
                            {tag.name}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[project.status]}`}>
                          {STATUS_LABELS[project.status]}
                        </span>
                        {project.due_date && (
                          <span className={`text-xs flex items-center gap-1 ${isOverdue(project.due_date) && project.status !== 'completed' ? 'text-red-500' : 'text-gray-500'}`}>
                            <CalendarIcon className="h-3 w-3" />
                            {formatDate(project.due_date)}
                          </span>
                        )}
                      </div>

                      <div className="mt-3">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 transition-all duration-300" 
                            style={{ width: `${project.progress}%` }} 
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">{project.progress}% complete</span>
                          {project.url && (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              <LinkIcon className="h-3 w-3" />
                              Link
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProject ? 'Edit Project' : 'New Project'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': currentTheme.primary_color }}
                  />
                  {formData.url && (
                    <a
                      href={formData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                      Test
                    </a>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Collection</label>
                  <select
                    value={formData.collection}
                    onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': currentTheme.primary_color }}
                  >
                    <option value="">No collection</option>
                    {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': currentTheme.primary_color }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex gap-2 flex-wrap">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        const newTags = formData.tags.includes(tag.id)
                          ? formData.tags.filter(id => id !== tag.id)
                          : [...formData.tags, tag.id];
                        setFormData({ ...formData, tags: newTags });
                      }}
                      className={`text-xs px-2 py-1 rounded-full transition-colors ${
                        formData.tags.includes(tag.id) ? 'text-white' : 'text-gray-600 bg-gray-100'
                      }`}
                      style={formData.tags.includes(tag.id) ? { backgroundColor: tag.color } : {}}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex rounded-lg border overflow-hidden">
                  {['active', 'completed', 'on_hold'].map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({ ...formData, status })}
                      className={`flex-1 px-3 py-2 text-sm ${formData.status === status ? 'text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                      style={formData.status === status ? { backgroundColor: STATUS_COLORS[status].includes('green') ? '#22c55e' : STATUS_COLORS[status].includes('blue') ? '#3b82f6' : '#eab308' } : {}}
                    >
                      {STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progress: {formData.progress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinned"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="pinned" className="text-sm text-gray-700">Pin project</label>
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
                  {editingProject ? 'Update' : 'Create'}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Project?</h3>
            <p className="text-gray-500 mb-4">This action cannot be undone.</p>
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

export default Projects;
