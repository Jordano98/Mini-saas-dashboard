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