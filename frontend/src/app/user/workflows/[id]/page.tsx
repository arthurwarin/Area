'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AuthGuard from '../../../../components/AuthGuard';
import { workflowService, Workflow } from '../../../../services/workflowService';

function WorkflowDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workflowId = params?.id as string;
  
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!workflowId) return;
      
      try {
        const data = await workflowService.getWorkflowById(Number(workflowId));
        setWorkflow(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch workflow');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflow();
  }, [workflowId]);

  const handleDelete = async () => {
    if (!workflow) return;
    
    setIsDeleting(true);
    setError('');

    try {
      await workflowService.deleteWorkflow(workflow.id);
      router.push('/user');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workflow');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error && !workflow) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-4">{error}</div>
            <button
              onClick={() => router.push('/user')}
              className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!workflow) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-xl mb-4">Workflow not found</div>
            <button
              onClick={() => router.push('/user')}
              className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/user')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-white">{workflow.name}</h1>
                  <p className="text-gray-400 mt-1">{workflow.description || 'No description'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Workflow
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Action Card */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  1
                </div>
                <h2 className="text-xl font-semibold text-white">Action (Trigger)</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Action ID</label>
                  <div className="text-white font-mono bg-gray-700 px-4 py-2 rounded-lg">
                    {workflow.actionId}
                  </div>
                </div>

                {workflow.actionData && workflow.actionData.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Configuration Data</label>
                    <div className="space-y-2">
                      {workflow.actionData.map((data: string, index: number) => (
                        <div key={index} className="bg-gray-700 px-4 py-2 rounded-lg">
                          <span className="text-gray-400 text-sm">Field {index + 1}:</span>
                          <span className="text-white ml-2 font-mono">{data}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reaction Card */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  2
                </div>
                <h2 className="text-xl font-semibold text-white">Reaction (Response)</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Reaction ID</label>
                  <div className="text-white font-mono bg-gray-700 px-4 py-2 rounded-lg">
                    {workflow.reactionId}
                  </div>
                </div>

                {workflow.reactionData && workflow.reactionData.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Configuration Data</label>
                    <div className="space-y-2">
                      {workflow.reactionData.map((data: string, index: number) => (
                        <div key={index} className="bg-gray-700 px-4 py-2 rounded-lg">
                          <span className="text-gray-400 text-sm">Field {index + 1}:</span>
                          <span className="text-white ml-2 font-mono">{data}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Metadata</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Workflow ID</label>
                <div className="text-white font-mono bg-gray-700 px-4 py-2 rounded-lg">
                  {workflow.id}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Created</label>
                <div className="text-white bg-gray-700 px-4 py-2 rounded-lg">
                  {workflow.createdAt ? new Date(workflow.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Last Updated</label>
                <div className="text-white bg-gray-700 px-4 py-2 rounded-lg">
                  {workflow.updatedAt ? new Date(workflow.updatedAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Delete Workflow?</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete "{workflow.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

export default WorkflowDetailPage;
