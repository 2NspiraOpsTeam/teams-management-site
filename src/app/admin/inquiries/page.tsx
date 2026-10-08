'use client';

import { useState } from 'react';

export default function InquiriesAdminPage() {
  const [filter, setFilter] = useState<'all' | 'submitted' | 'resolved'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null as any);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-serif font-semibold text-slate-900 mb-6">
        Inquiries Management
      </h1>

      {/* Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <p className="text-sm text-slate-500">
            View and manage contact form submissions. All inquiries are persisted durably before notification.
          </p>
          
          <div className="flex flex-wrap gap-2">
            {['all', 'submitted', 'resolved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  filter === f 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* TODO: Inquiry count stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">12</p>
            <p className="text-xs text-slate-500">Total inquiries</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">3</p>
            <p className="text-xs text-slate-500">Pending follow-up</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">9</p>
            <p className="text-xs text-slate-500">Resolved</p>
          </div>
        </div>
      </div>

      {/* Inquiry List */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Created</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-slate-200">
            {/* TODO: Load inquiries from D1 */}
            {[1, 2, 3].map((i) => (
              <tr key={i} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedInquiry(i)}>
                <td className="px-4 py-3 text-sm text-slate-600">#{String(i).padStart(4, '0')}</td>
                <td className="px-4 py-3 text-sm text-slate-600 capitalize">{['general', 'property', 'owner_business'][i % 3]}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    ['submitted', 'resolved'].includes(['all', 'submitted', 'resolved'][i % 3]) 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {['all', 'submitted', 'resolved'][i % 3]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">2026-10-{7 + i}-07</td>
                <td className="px-4 py-3 text-right text-sm">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">View</button>
                  {['submitted'].includes(['all', 'submitted', 'resolved'][i % 3]) && (
                    <button className="text-green-600 hover:text-green-800">Mark Resolved</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {selectedInquiry && (
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <h4 className="font-medium text-slate-900 mb-2">Inquiry #{selectedInquiry}</h4>
            <p className="text-sm text-slate-600">
              [Inquiry detail view]: Source, category, contact hash (encrypted reference), routing destination, follow-up notes<br />
              Update status, add internal notes, mark resolved
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Note on Inquiry Persistence</h3>
        <p className="text-sm text-blue-800">
          All inquiries are durably persisted to D1 before any notification is sent. 
          If email/SMS provider fails, the inquiry remains in system for follow-up.
        </p>
      </div>
    </div>
  );
}
