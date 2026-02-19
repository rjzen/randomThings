import React, { useState, useEffect, useCallback, useRef } from 'react';
import { notesAPI } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { Toaster, toast } from 'react-hot-toast';
import {
  FolderIcon,
  TagIcon,
  PlusIcon,
  TrashIcon,
  ArchiveBoxIcon,
  PencilIcon,
  ArrowUturnLeftIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  StarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const PRESET_COLORS = [
  '#ffffff', '#fef3c7', '#dcfce7', '#dbeafe', 
  '#f3e8ff', '#fce7f3', '#fee2e2', '#e0e7ff'
];

const Notes = () => {
  const { currentTheme } = useTheme();
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [view, setView] = useState('all');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [newNoteData, setNewNoteData] = useState({
    title: '',
    content: '',
    folder: '',
    tag_ids: [],
    color: '#ffffff'
  });
  const saveTimeoutRef = useRef(null);

  useEffect(() => { fetchData(); }, [view, selectedFolder, selectedTag, searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedFolder) params.folder = selectedFolder;
      if (selectedTag) params.tag = selectedTag;
      if (view === 'archived') params.archived = 'true';
      if (view === 'trash') params.deleted = 'true';
      
      const [foldersData, tagsData, notesData] = await Promise.all([
        notesAPI.getFolders(),
        notesAPI.getTags(),
        notesAPI.getNotes(params)
      ]);
      setFolders(foldersData);
      setTags(tagsData);
      setNotes(notesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    setNewNoteData({
      title: '',
      content: '',
      folder: selectedFolder || '',
      tag_ids: selectedTag ? [selectedTag] : [],
      color: '#ffffff'
    });
    setShowNewNoteModal(true);
  };

  const saveNewNote = async () => {
    try {
      const data = { ...newNoteData };
      if (data.folder === '') delete data.folder;
      const newNote = await notesAPI.createNote(data);
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
      setShowNewNoteModal(false);
      setView('all');
      toast.success('Note created');
    } catch (error) {
      console.error('Failed to create note:', error);
      toast.error('Failed to create note');
    }
  };

  const updateNote = useCallback(async (id, data) => {
    try {
      const updated = await notesAPI.updateNote(id, data);
      setNotes(notes.map(n => n.id === id ? updated : n));
      if (selectedNote?.id === id) setSelectedNote(updated);
      return updated;
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  }, [notes, selectedNote]);

  const handleNoteChange = (field, value) => {
    if (!selectedNote) return;
    const updated = { ...selectedNote, [field]: value };
    setSelectedNote(updated);
    setNotes(notes.map(n => n.id === updated.id ? updated : n));
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => updateNote(updated.id, { [field]: value }), 1000);
  };

  const deleteNote = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await notesAPI.deleteNote(id);
      setNotes(notes.filter(n => n.id !== id));
      if (selectedNote?.id === id) setSelectedNote(null);
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const moveToTrash = async (id) => {
    try {
      const updated = await notesAPI.trashNote(id);
      setNotes(notes.filter(n => n.id !== id));
      if (selectedNote?.id === id) setSelectedNote(null);
      toast.success('Moved to trash');
    } catch (error) {
      toast.error('Failed to move to trash');
    }
  };

  const restoreNote = async (id) => {
    try {
      const updated = await notesAPI.restoreNote(id);
      setNotes(notes.filter(n => n.id !== id));
      toast.success('Note restored');
    } catch (error) {
      toast.error('Failed to restore note');
    }
  };

  const archiveNote = async (id) => {
    try {
      const updated = await notesAPI.archiveNote(id);
      setNotes(notes.filter(n => n.id !== id));
      if (selectedNote?.id === id) setSelectedNote(null);
      toast.success(updated.is_archived ? 'Note archived' : 'Note unarchived');
    } catch (error) {
      toast.error('Failed to archive note');
    }
  };

  const pinNote = async (id) => {
    try {
      const updated = await notesAPI.pinNote(id);
      setNotes(notes.map(n => n.id === id ? updated : n));
      if (selectedNote?.id === id) setSelectedNote(updated);
    } catch (error) {
      toast.error('Failed to pin note');
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const folder = await notesAPI.createFolder(newFolderName);
      setFolders([...folders, folder]);
      setNewFolderName('');
      setShowNewFolderInput(false);
      toast.success('Folder created');
    } catch (error) {
      toast.error('Failed to create folder');
    }
  };

  const deleteFolder = async (id) => {
    if (!window.confirm('Delete this folder?')) return;
    try {
      await notesAPI.deleteFolder(id);
      setFolders(folders.filter(f => f.id !== id));
      if (selectedFolder === id) setSelectedFolder(null);
      toast.success('Folder deleted');
    } catch (error) {
      toast.error('Failed to delete folder');
    }
  };

  const createTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const tag = await notesAPI.createTag({ name: newTagName, color: newTagColor });
      setTags([...tags, tag]);
      setNewTagName('');
      setShowNewTagInput(false);
      toast.success('Tag created');
    } catch (error) {
      toast.error('Failed to create tag');
    }
  };

  const deleteTag = async (id) => {
    if (!window.confirm('Delete this tag?')) return;
    try {
      await notesAPI.deleteTag(id);
      setTags(tags.filter(t => t.id !== id));
      if (selectedTag === id) setSelectedTag(null);
      toast.success('Tag deleted');
    } catch (error) {
      toast.error('Failed to delete tag');
    }
  };

  const stripMarkdown = (text) => {
    return text?.replace(/[#*_`~\[\]]/g, '').slice(0, 100) || '';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedNote) return;
    try {
      const formData = new FormData();
      formData.append('image', file);
      const image = await notesAPI.uploadImage(selectedNote.id, formData);
      const newContent = selectedNote.content + `\n![image](${image.image_url})\n`;
      handleNoteChange('content', newContent);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const NavItem = ({ icon: Icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        active ? 'text-white' : 'text-gray-700 hover:bg-gray-100'
      }`}
      style={active ? { backgroundColor: currentTheme.primary_color } : {}}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-600 mt-2">Keep track of your thoughts and ideas.</p>
        </div>
      </div>

      <div className="flex h-[calc(100vh-14rem)] bg-white rounded-xl shadow-sm border">
        {/* Left Sidebar */}
        <div className={`${showSidebar ? 'w-64' : 'w-0'} transition-all duration-300 border-r overflow-hidden flex flex-col`}>
          <div className="p-4 border-b">
            <button
              onClick={createNote}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: currentTheme.primary_color }}
            >
              <PlusIcon className="h-5 w-5" />
              New Note
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            <NavItem icon={PencilIcon} label="All Notes" active={view === 'all'} onClick={() => { setView('all'); setSelectedFolder(null); setSelectedTag(null); }} />
            <NavItem icon={StarIcon} label="Pinned" active={view === 'pinned'} onClick={() => setView('pinned')} />
            <NavItem icon={ArchiveBoxIcon} label="Archived" active={view === 'archived'} onClick={() => setView('archived')} />
            <NavItem icon={TrashIcon} label="Trash" active={view === 'trash'} onClick={() => setView('trash')} />

            {/* Folders */}
            <div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Folders</span>
                <button onClick={() => setShowNewFolderInput(true)} className="text-gray-400 hover:text-gray-600">
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              {showNewFolderInput && (
                <div className="px-3 pb-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createFolder()}
                    placeholder="Folder name"
                    className="w-full px-2 py-1 text-sm border rounded"
                    autoFocus
                  />
                  <div className="flex gap-1 mt-1">
                    <button onClick={createFolder} className="text-xs text-indigo-600">Add</button>
                    <button onClick={() => setShowNewFolderInput(false)} className="text-xs text-gray-500">Cancel</button>
                  </div>
                </div>
              )}
              {folders.map(folder => (
                <div
                  key={folder.id}
                  onClick={() => { setSelectedFolder(folder.id); setView('all'); setSelectedTag(null); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer ${
                    selectedFolder === folder.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FolderIcon className="h-4 w-4" />
                    <span>{folder.name}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }} className="text-gray-400 hover:text-red-500">
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Tags</span>
                <button onClick={() => setShowNewTagInput(true)} className="text-gray-400 hover:text-gray-600">
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              {showNewTagInput && (
                <div className="px-3 pb-2 space-y-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Tag name"
                    className="w-full px-2 py-1 text-sm border rounded"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    {['#6366f1', '#ef4444', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6'].map(c => (
                      <button
                        key={c}
                        onClick={() => setNewTagColor(c)}
                        className={`w-5 h-5 rounded-full ${newTagColor === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={createTag} className="text-xs text-indigo-600">Add</button>
                    <button onClick={() => setShowNewTagInput(false)} className="text-xs text-gray-500">Cancel</button>
                  </div>
                </div>
              )}
              {tags.map(tag => (
                <div
                  key={tag.id}
                  onClick={() => { setSelectedTag(tag.id); setView('all'); setSelectedFolder(null); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer ${
                    selectedTag === tag.id ? 'bg-indigo-50' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                    <span>{tag.name}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteTag(tag.id); }} className="text-gray-400 hover:text-red-500">
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="w-80 border-r bg-gray-50 flex flex-col">
          <div className="p-3 border-b bg-white">
            <button onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden mr-2 p-1">
              <FolderIcon className="h-5 w-5" />
            </button>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': currentTheme.primary_color }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <PencilIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No notes yet</p>
              </div>
            ) : (
              notes.map(note => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`p-4 border-b cursor-pointer hover:bg-white transition-colors ${
                    selectedNote?.id === note.id ? 'bg-white border-l-4' : ''
                  }`}
                  style={{ 
                    borderLeftColor: selectedNote?.id === note.id ? currentTheme.primary_color : 'transparent',
                    backgroundColor: note.color && note.color !== '#ffffff' ? note.color : 'transparent'
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-full rounded-full self-stretch" style={{ backgroundColor: note.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {note.is_pinned && <StarIcon className="h-4 w-4 text-yellow-500" />}
                        <h3 className="font-medium text-gray-900 truncate">{note.title || 'Untitled'}</h3>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-1">{stripMarkdown(note.content) || 'No content'}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {note.folder_name && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <FolderIcon className="h-3 w-3" />
                            {note.folder_name}
                          </span>
                        )}
                        {note.tags?.slice(0, 2).map(tag => (
                          <span key={tag.id} className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: tag.color }}>
                            {tag.name}
                          </span>
                        ))}
                        <span className="text-xs text-gray-400 ml-auto">{formatDate(note.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Note Editor */}
        <div className="flex-1 flex flex-col" style={{ backgroundColor: selectedNote?.color || '#ffffff' }}>
          <Toaster position="top-right" />
          {selectedNote ? (
            <>
              <div className="p-4 border-b flex items-center justify-between">
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => handleNoteChange('title', e.target.value)}
                  placeholder="Note title"
                  className="text-xl font-semibold flex-1 border-none focus:outline-none bg-transparent"
                  style={{ backgroundColor: selectedNote.color || '#ffffff' }}
                />
                <div className="flex items-center gap-2">
                  <button onClick={() => pinNote(selectedNote.id)} className={`p-2 rounded-lg ${selectedNote.is_pinned ? 'text-yellow-500' : 'text-gray-400'}`}>
                    <StarIcon className="h-5 w-5" />
                  </button>
                  <div className="relative">
                    <button onClick={() => setShowColorPicker(!showColorPicker)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 border-2 border-gray-300">
                      <div className="w-5 h-5 rounded" style={{ backgroundColor: selectedNote.color }} />
                    </button>
                    {showColorPicker && (
                      <div className="absolute right-0 top-12 bg-white shadow-xl rounded-lg p-4 z-10 min-w-[200px]">
                        <p className="text-xs font-medium text-gray-600 mb-3">Note Color</p>
                        <div className="grid grid-cols-4 gap-3">
                          {PRESET_COLORS.map(c => (
                            <button
                              key={c}
                              onClick={() => { handleNoteChange('color', c); setShowColorPicker(false); }}
                              className={`w-10 h-10 rounded-lg border-3 transition-transform hover:scale-110 ${
                                selectedNote.color === c ? 'border-gray-800 ring-2 ring-gray-400' : 'border-gray-200'
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <label className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer">
                    <PhotoIcon className="h-5 w-5" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  {view !== 'trash' && (
                    <button onClick={() => archiveNote(selectedNote.id)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
                      <ArchiveBoxIcon className="h-5 w-5" />
                    </button>
                  )}
                  {view !== 'trash' ? (
                    <button onClick={() => moveToTrash(selectedNote.id)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  ) : (
                    <>
                      <button onClick={() => restoreNote(selectedNote.id)} className="p-2 rounded-lg text-green-500 hover:bg-gray-100">
                        <ArrowUturnLeftIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => deleteNote(selectedNote.id)} className="p-2 rounded-lg text-red-500 hover:bg-gray-100">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="p-4 border-b flex items-center gap-2 flex-wrap">
                <select
                  value={selectedNote.folder || ''}
                  onChange={(e) => handleNoteChange('folder', e.target.value || null)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="">No folder</option>
                  {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <div className="flex gap-1 flex-wrap">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        const currentTags = selectedNote.tags?.map(t => t.id) || [];
                        const newTags = currentTags.includes(tag.id) 
                          ? currentTags.filter(id => id !== tag.id)
                          : [...currentTags, tag.id];
                        handleNoteChange('tag_ids', newTags);
                      }}
                      className={`text-xs px-2 py-1 rounded-full transition-colors ${
                        selectedNote.tags?.some(t => t.id === tag.id) ? 'text-white' : 'text-gray-600 bg-gray-100'
                      }`}
                      style={selectedNote.tags?.some(t => t.id === tag.id) ? { backgroundColor: tag.color } : {}}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-4 overflow-auto">
                <textarea
                  value={selectedNote.content}
                  onChange={(e) => handleNoteChange('content', e.target.value)}
                  placeholder="Start writing... (Use markdown format: ![image](url) for images)"
                  className="w-full h-full resize-none border-none focus:outline-none text-gray-700 leading-relaxed whitespace-pre-wrap rounded-lg"
                  style={{ backgroundColor: selectedNote.color || '#ffffff' }}
                />
                {selectedNote.content.includes('![') && (
                  <div className="mt-4 p-3 bg-white/50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-2">Image preview:</p>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: selectedNote.content
                          .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg mb-2" />')
                          .replace(/\n/g, '<br/>')
                      }} 
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <PencilIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Select a note or create a new one</p>
              </div>
              </div>
            )}
        </div>

        {/* New Note Modal */}
        {showNewNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Create New Note</h3>
                <button onClick={() => setShowNewNoteModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <input
                    type="text"
                    value={newNoteData.title}
                    onChange={(e) => setNewNoteData({ ...newNoteData, title: e.target.value })}
                    placeholder="Note title"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': currentTheme.primary_color }}
                    autoFocus
                  />
                </div>
                <div>
                  <textarea
                    value={newNoteData.content}
                    onChange={(e) => setNewNoteData({ ...newNoteData, content: e.target.value })}
                    placeholder="Start writing..."
                    rows={6}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': currentTheme.primary_color }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Color:</span>
                  <div className="flex gap-1">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setNewNoteData({ ...newNoteData, color: c })}
                        className={`w-6 h-6 rounded ${newNoteData.color === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={newNoteData.folder}
                    onChange={(e) => setNewNoteData({ ...newNoteData, folder: e.target.value })}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="">No folder</option>
                    {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                  <div className="flex gap-1 flex-wrap">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => {
                          const currentTags = newNoteData.tag_ids || [];
                          const newTags = currentTags.includes(tag.id)
                            ? currentTags.filter(id => id !== tag.id)
                            : [...currentTags, tag.id];
                          setNewNoteData({ ...newNoteData, tag_ids: newTags });
                        }}
                        className={`text-xs px-2 py-1 rounded-full transition-colors ${
                          newNoteData.tag_ids?.includes(tag.id) ? 'text-white' : 'text-gray-600 bg-gray-100'
                        }`}
                        style={newNoteData.tag_ids?.includes(tag.id) ? { backgroundColor: tag.color } : {}}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t flex gap-3">
                <button
                  onClick={() => setShowNewNoteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNewNote}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: currentTheme.primary_color }}
                >
                  Create Note
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trash Warning */}
        {view === 'trash' && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 shadow-lg">
            <p className="text-sm text-yellow-800">
              Notes in trash are permanently deleted after 30 days
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
