'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Project, ProjectStatus } from '@/types/project';

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  // Modal Handling State Engines
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    status: 'active' as ProjectStatus,
    deadline: '',
    assigned_member: '',
    budget: '',
  });

  const fetchDashboardProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProjects(data as Project[]);
    } catch (err) {
      console.error(err);
    } {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardProjects();
  }, []);

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({ title: '', status: 'active', deadline: '', assigned_member: '', budget: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      status: project.status,
      deadline: project.deadline,
      assigned_member: project.assigned_member,
      budget: project.budget.toString(),
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBudget = parseFloat(formData.budget);

    try {
      if (editingProject) {
        // [U]PDATE Action
        await supabase.from('projects').update({
          title: formData.title,
          status: formData.status,
          deadline: formData.deadline,
          assigned_member: formData.assigned_member,
          budget: parsedBudget,
        }).eq('id', editingProject.id);
      } else {
        // [C]REATE Action
        await supabase.from('projects').insert([{
          title: formData.title,
          status: formData.status,
          deadline: formData.deadline,
          assigned_member: formData.assigned_member,
          budget: parsedBudget,
        }]);
      }
      setIsModalOpen(false);
      fetchDashboardProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await supabase.from('projects').delete().eq('id', id);
    fetchDashboardProjects();
  };

  const filteredProjects = projects.filter((project) => {
    return (
      (project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.assigned_member.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === 'all' || project.status === statusFilter)
    );
  });

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">SaaS Workspace</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor development lifecycles and budgets.</p>
          </div>
          <button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm">
            + New Project
          </button>
        </header>

        <section className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <input
            type="text"
            placeholder="Search project titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg bg-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
            className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="on hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </section>

        {loading ? (
          <div className="text-center py-20 text-gray-500 animate-pulse">Syncing matrix lines...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                  <th className="px-6 py-4">Project Scope</th>
                  <th className="px-6 py-4">Status Flag</th>
                  <th className="px-6 py-4">Team Member</th>
                  <th className="px-6 py-4">Target Deadline</th>
                  <th className="px-6 py-4 text-right">Budget Allocation</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50/70">
                    <td className="px-6 py-4 font-medium text-gray-950">{project.title}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border uppercase ${
                        project.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                        project.status === 'on hold' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>{project.status}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{project.assigned_member}</td>
                    <td className="px-6 py-4 text-gray-600">{project.deadline}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-950">${project.budget}</td>
                    <td className="px-6 py-4 text-center space-x-2">
                      <button onClick={() => openEditModal(project)} className="text-indigo-600 hover:text-indigo-900 font-medium mr-2">Edit</button>
                      <button onClick={() => handleDeleteProject(project.id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- Phase 5 Form Modal Window Component --- */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{editingProject ? 'Edit Project Metrics' : 'Create New Project Record'}</h3>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Project Scope Name</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status Workflow Flag</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="active">Active</option>
                    <option value="on hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Assigned Team Member</label>
                  <input type="text" required value={formData.assigned_member} onChange={(e) => setFormData({ ...formData, assigned_member: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Target Deadline</label>
                  <input type="date" required value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Budget Allocation ($)</label>
                  <input type="number" step="0.01" required value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">{editingProject ? 'Save Changes' : 'Create Record'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}