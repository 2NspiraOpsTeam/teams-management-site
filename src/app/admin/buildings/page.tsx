'use client';

import { useState } from 'react';

export default function BuildingsAdminPage() {
  const [buildings, setBuildings] = useState([] as any);
  const [showForm, setShowForm] = useState(false);
  const [newBuilding, setNewBuilding] = useState({
    name: '',
    address: '',
    neighborhood: '',
    status: 'published' as 'draft' | 'published' | 'archived'
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-serif font-semibold text-slate-900 mb-6">
        Buildings Management
      </h1>

      {/* Building List */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6">
        {buildings.length === 0 && (
          <p className="p-4 text-slate-500 text-sm text-center">
            No buildings yet. Use the form below to add your first property.
          </p>
        )}
        
        {/* TODO: Render building cards when data loaded from D1 */}
        <div className="space-y-2 p-4">
          <p className="text-sm text-slate-500 italic">
            [Building list will load from database]<br />
            Display columns: Name, Address, Status, Published Date, Actions<br />
            Click edit to modify | Click preview to review content | Click publish/unpublish
          </p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form 
          onSubmit={(e) => { e.preventDefault(); setShowForm(false); }}
          className="bg-slate-50 border border-slate-200 rounded-lg p-6"
        >
          <h3 className="font-medium text-slate-900 mb-4">{newBuilding.name ? 'Edit Building' : 'Add New Building'}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Property Name</label>
              <input 
                type="text"
                required
                value={newBuilding.name}
                onChange={(e) => setNewBuilding(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
              <input 
                type="text"
                required
                value={newBuilding.address}
                onChange={(e) => setNewBuilding(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Neighborhood</label>
              <input 
                type="text"
                value={newBuilding.neighborhood}
                onChange={(e) => setNewBuilding(prev => ({ ...prev, neighborhood: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Publication State</label>
              <select 
                value={newBuilding.status}
                onChange={(e) => setNewBuilding(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
              >
                <option value="draft">Draft (not public)</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Add more fields: description, amenities, coordinates, media gallery */}
            
            <div className="flex gap-3 pt-4">
              <button 
                type="submit"
                className="flex-1 px-4 py-2 rounded font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors text-sm"
              >
                Save Building
              </button>
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 rounded font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="mt-6 flex justify-between items-center">
        <p className="text-sm text-slate-500">
          Total buildings: <span className="font-medium">{buildings.length}</span>
        </p>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded font-medium bg-white border border-slate-300 text-slate-700 hover:border-slate-400 transition-colors text-sm"
          >
            + Add New Building
          </button>
        )}
      </div>
    </div>
  );
}
