'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Project, ProjectStatus } from '@/types/project';

export default function Dashboard() {
  //Component Application State
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  //Live Stream Fetcher
  useEffect(() => {
    async function fetchDashboardProjects() {
      try {
        setLoading(true);
        // Queries our cloud table, arranging columns by creation date
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setProjects(data as Project[]);
      } catch (err) {
        console.error('Data loading error:', err);
        alert('Communication breakdown while retrieving cloud records.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardProjects();
  }, []);
//Real-Time Search & Filtering Logic
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.assigned_member.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Workspace Shell Header */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">SaaS Workspace</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor development lifecycles, team allocation, and fiscal updates.</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
            + New Project
          </button>
        </header>

        {/* Real-time Controller Bar */}
        <section className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <input
            type="text"
            placeholder="Search project titles or teammates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm text-sm"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
            className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm text-sm cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="on hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </section>

        {/* Data Visualization Presentation Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-medium tracking-wide animate-pulse">
            Establishing downstream sync with cloud records...
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-4">Project Scope</th>
                  <th className="px-6 py-4">Status Flag</th>
                  <th className="px-6 py-4">Team Member</th>
                  <th className="px-6 py-4">Target Deadline</th>
                  <th className="px-6 py-4 text-right">Budget Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      No matching dashboard matrices found. Clear filters to refresh.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-950">{project.title}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border uppercase tracking-wider ${
                          project.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                          project.status === 'on hold' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{project.assigned_member}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(project.deadline).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-950">
                        ${project.budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </main>
  );
}