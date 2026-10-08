'use client';

import { useState } from 'react';

export default function MediaAdminPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState({ visibility: 'public' as 'public' | 'internal' | 'private' });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-serif font-semibold text-slate-900 mb-6">
        Media Management
      </h1>

      {/* Upload Section */}
      {showUpload && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-medium text-blue-900 mb-4">Upload New Media</h3>
          
          <form 
            onSubmit={(e) => { e.preventDefault(); setShowUpload(false); }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">File</label>
              <input 
                type="file"
                accept="image/*,.pdf"
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">File Type</label>
                <input 
                  type="text"
                  placeholder="image/jpeg (auto-detected)"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Visibility</label>
                <select 
                  value={selectedAsset.visibility}
                  onChange={(e) => setSelectedAsset(prev => ({ ...prev, visibility: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                >
                  <option value="public">Public (building/gallery)</option>
                  <option value="internal">Internal (lobby, amenities)</option>
                  <option value="private">Private (maintenance/work orders)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Purpose/Category</label>
                <input 
                  type="text"
                  placeholder="e.g., lobby, exterior, kitchen"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Caption</label>
                <input 
                  type="text"
                  placeholder="Descriptive caption for the image"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alt Text (Accessibility)</label>
                <input 
                  type="text"
                  placeholder="Describe image for screen readers"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="submit"
                className="flex-1 px-4 py-2 rounded font-medium bg-green-600 text-white hover:bg-green-700 transition-colors text-sm"
              >
                Upload Media
              </button>
              <button 
                type="button"
                onClick={() => setShowUpload(false)}
                className="flex-1 px-4 py-2 rounded font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Media Gallery */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-slate-900">Media Assets</h3>
          {!showUpload && (
            <button 
              onClick={() => setShowUpload(true)}
              className="px-4 py-2 rounded font-medium bg-white border border-slate-300 text-slate-700 hover:border-slate-400 transition-colors text-sm"
            >
              + Upload New Media
            </button>
          )}
        </div>

        {/* TODO: Display media grid with thumbnails */}
        <p className="text-sm text-slate-500 italic p-4">
          [Media gallery will show uploaded images]<br />
          Features: drag-and-drop reordering, cover image selection,<br />
          visibility filters (public/internal/private), bulk actions<br />
          Reuse assets across buildings/units/layouts
        </p>
      </div>

      {/* Reuse Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h3 className="font-medium text-slate-900 mb-4">Media Reuse & Assignment</h3>
        
        <p className="text-sm text-slate-600 mb-4">
          One media asset can be assigned to multiple properties, units, or layouts. 
          Create a single lobby photo and reuse it across buildings.
        </p>

        {/* TODO: Assignment form */}
        <div className="space-y-3 p-4 border border-dashed border-slate-300 rounded">
          <p className="text-sm text-slate-500">
            [Assignment panel]<br />
            Select existing asset → Assign to buildings/units/layouts → Set as cover → Order in gallery
          </p>
        </div>
      </div>
    </div>
  );
}
