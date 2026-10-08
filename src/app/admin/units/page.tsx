'use client';

import { useState } from 'react';

export default function UnitsAdminPage() {
  const [showForm, setShowForm] = useState(false);
  const [unitData, setUnitData] = useState({
    building: '',
    identifier: '',
    floor: 1,
    layout: '',
    status: 'available_internal' as any
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-serif font-semibold text-slate-900 mb-6">
        Units Management
      </h1>

      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-slate-500 mb-3">
          Internal unit records for maintenance, tenant services, and operations. 
          <br />
          Note: Units are <strong>not exposed</strong> to public website in Phase 1.
        </p>
        
        {/* Unit table/list */}
        <div className="space-y-2 p-4">
          <p className="text-sm text-slate-500 italic">
            [Unit list will load from D1]<br />
            Columns: Building, Unit ID, Floor, Status, Layout, Created, Actions<br />
            Search/filter by building or unit identifier<br />
            Edit status (available→occupied→maintenance)<br />
            Add/edit/delete units
          </p>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <form 
          onSubmit={(e) => { e.preventDefault(); setShowForm(false); }}
          className="bg-slate-50 border border-slate-200 rounded-lg p-6"
        >
          <h3 className="font-medium text-slate-900 mb-4">Add New Unit</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Building (required)
              </label>
              <select 
                required
                value={unitData.building}
                onChange={(e) => setUnitData(prev => ({ ...prev, building: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
              >
                <option value="">Select a building...</option>
                {/* TODO: Load buildings from D1 */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Unit Identifier (e.g., A1, 2B, PH-A)
              </label>
              <input 
                type="text"
                required
                placeholder="A1, 2B, etc."
                value={unitData.identifier}
                onChange={(e) => setUnitData(prev => ({ ...prev, identifier: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Floor</label>
                <input 
                  type="number"
                  required
                  min={1}
                  value={unitData.floor}
                  onChange={(e) => setUnitData(prev => ({ ...prev, floor: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Layout</label>
                <select 
                  value={unitData.layout}
                  onChange={(e) => setUnitData(prev => ({ ...prev, layout: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                >
                  <option value="">Assign later...</option>
                  {/* TODO: Load layouts from D1 */}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Internal Status</label>
              <select 
                value={unitData.status}
                onChange={(e) => setUnitData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
              >
                <option value="available_internal">Available for lease</option>
                <option value="occupied">Occupied</option>
                <option value="under_construction">Under construction</option>
                <option value="maintenance">Maintenance status</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="submit"
                className="flex-1 px-4 py-2 rounded font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors text-sm"
              >
                Save Unit
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="mt-6 flex justify-between items-center">
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded font-medium bg-white border border-slate-300 text-slate-700 hover:border-slate-400 transition-colors text-sm"
          >
            + Add New Unit
          </button>
        )}
      </div>
    </div>
  );
}
