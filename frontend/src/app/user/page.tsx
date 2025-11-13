'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthGuard from '../../components/AuthGuard';
import { authService } from '../../services/authService';
import { workflowService, Workflow } from '../../services/workflowService';
import { useRouter } from 'next/navigation';

interface UserData {
  id: number;
  email: string;
  role: string;
}

function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    pausedWorkflows: 0,
    totalRuns: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        // Fetch real workflows from API
        const workflowsData = await workflowService.getWorkflows();
        setWorkflows(workflowsData);
        
        // Calculate stats from real data
        setStats({
          totalWorkflows: workflowsData.length,
          activeWorkflows: workflowsData.length, // Tous les workflows sont actifs par défaut
          pausedWorkflows: 0,
          totalRuns: 0 // À implémenter plus tard avec des logs
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        if (err instanceof Error && (err.message.includes('token') || err.message.includes('Authentication'))) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">
            {error || 'Failed to load user data'}
          </div>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const getUserInitials = () => {
    if (!user.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!user || !user.email) return 'User';
    return user.email.split('@')[0];
  };

  const handleLogout = () => {
    authService.removeToken();
    router.push('/');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-between items-center">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 text-sm font-medium text-cyan-400">
                <span className="mr-2 h-2 w-2 rounded-full bg-cyan-500"></span>
                Dashboard
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, <span className="text-cyan-400">{getUserDisplayName().split(' ')[0]}</span>! 👋
              </h1>
              <p className="text-xl text-gray-300">
                Here's what's happening with your automations today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-medium">
                    {getUserInitials()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-white">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-300">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Logout"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-linear-to-br from-cyan-50 to-cyan-100 rounded-2xl p-6 border border-cyan-200">
              <div className="flex items-center">
                <div className="shrink-0">
                  <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-cyan-700">Total Workflows</dt>
                  <dd className="text-2xl font-bold text-cyan-900">{stats.totalWorkflows}</dd>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center">
                <div className="shrink-0">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-green-700">Active</dt>
                  <dd className="text-2xl font-bold text-green-900">{stats.activeWorkflows}</dd>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200">
              <div className="flex items-center">
                <div className="shrink-0">
                  <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-yellow-700">Paused</dt>
                  <dd className="text-2xl font-bold text-yellow-900">{stats.pausedWorkflows}</dd>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center">
                <div className="shrink-0">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-blue-700">Total Runs</dt>
                  <dd className="text-2xl font-bold text-blue-900">{stats.totalRuns}</dd>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link
              href="/user/workflows/new"
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center group-hover:bg-cyan-600 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors">Create Workflow</h3>
                  <p className="text-sm text-gray-600">Build a new automation</p>
                </div>
              </div>
            </Link>

            <Link
              href="/user/integrations"
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Integrations</h3>
                  <p className="text-sm text-gray-600">Connect your apps</p>
                </div>
              </div>
            </Link>

            <Link
              href="/user/settings"
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">Settings</h3>
                  <p className="text-sm text-gray-600">Manage your account</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Workflows */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 mb-12">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Your Workflows</h3>
                <Link
                  href="/user/workflows/create"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
                >
                  + Create Workflow
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {workflows.length === 0 ? (
                <div className="px-8 py-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No workflows</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new workflow.</p>
                  <div className="mt-6">
                    <Link
                      href="/user/workflows/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create your first workflow
                    </Link>
                  </div>
                </div>
              ) : (
                workflows.map((workflow) => (
                  <Link 
                    key={workflow.id} 
                    href={`/user/workflows/${workflow.id}`}
                    className="block px-8 py-6 hover:bg-white rounded-2xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="shrink-0">
                          <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        </div>
                        <div className="ml-6">
                          <p className="text-lg font-semibold text-gray-900">{workflow.name}</p>
                          <p className="text-sm text-gray-600">{workflow.description || 'No description'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                href="/user/workflows/create"
                className="block p-6 bg-white rounded-2xl border border-gray-200 hover:border-cyan-300 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
                      <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-base font-semibold text-gray-900">Create Workflow</p>
                    <p className="text-sm text-gray-600">Start automating</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/user/integrations"
                className="block p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-base font-semibold text-gray-900">Intégrations</p>
                    <p className="text-sm text-gray-600">Add integrations</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/user/history"
                className="block p-6 bg-white rounded-2xl border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                      <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-base font-semibold text-gray-900">View History</p>
                    <p className="text-sm text-gray-600">Execution logs</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/user/settings"
                className="block p-6 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-base font-semibold text-gray-900">Settings</p>
                    <p className="text-sm text-gray-600">Manage account</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <AuthGuard>
      <UserDashboard />
    </AuthGuard>
  );
}
