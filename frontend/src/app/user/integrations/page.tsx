'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { integrationService } from '../../../services/integrationService';
import AuthGuard from '../../../components/AuthGuard';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  connected: boolean;
  lastSync?: string;
}

interface Connection {
  id: string;
  serviceType: string;
  serviceName: string;
  isConnected: boolean;
  connectedAt?: string;
}

export default function IntegrationsPage() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Define available integrations with useMemo to avoid re-creation on every render
  const availableIntegrations = useMemo((): Integration[] => [
    {
      id: 'github',
      name: 'GitHub',
      description: 'Connectez votre compte GitHub pour automatiser vos workflows de développement',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      color: 'text-gray-900',
      connected: false
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Connectez votre compte Discord pour recevoir des notifications et automatiser vos serveurs',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
        </svg>
      ),
      color: 'text-indigo-600',
      connected: false
    },
    {
      id: 'reddit',
      name: 'Reddit',
      description: 'Connectez votre compte Reddit pour automatiser vos posts et interactions',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
      ),
      color: 'text-orange-600',
      connected: false
    },
    {
      id: 'spotify',
      name: 'Spotify',
      description: 'Connectez votre compte Spotify pour automatiser vos playlists et découvrir de la musique',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      ),
      color: 'text-green-600',
      connected: false
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Connectez votre compte Slack pour envoyer des messages et automatiser vos communications d\'équipe',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
        </svg>
      ),
      color: 'text-purple-600',
      connected: false
    },
    {
      id: 'timer',
      name: 'Timer',
      description: 'Déclenchez des actions basées sur la date et l\'heure (pas d\'authentification requise)',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
        </svg>
      ),
      color: 'text-blue-600',
      connected: true // Timer is always "connected" since it's internal
    }
  ], []);

  const loadConnectionsCallback = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await integrationService.getUserConnections();
      console.log('Raw connections data from API:', data);
      // Backend returns array directly, not wrapped in connections property
      const connections = Array.isArray(data) ? data : [];
      console.log('Processed connections:', connections);
      setConnections(connections);
      
      // Update integrations with connection status
      const updatedIntegrations = availableIntegrations.map(integration => {
        const isConnected = connections.some((conn: any) => 
          conn.serviceName === integration.id && conn.connected
        );
        console.log(`Integration ${integration.id}: connected=${isConnected}`);
        return {
          ...integration,
          connected: isConnected,
          lastSync: connections.find((conn: any) => 
            conn.serviceName === integration.id && conn.connected
          )?.createdAt
        };
      });
      
      console.log('Updated integrations:', updatedIntegrations);
      setIntegrations(updatedIntegrations);
    } catch (error) {
      console.error('Failed to load connections:', error);
      setError('Failed to load connections');
      // Fallback to available integrations without connection status
      setIntegrations(availableIntegrations);
    } finally {
      setIsLoading(false);
    }
  }, [availableIntegrations]);

  useEffect(() => {
    if (user) {
      loadConnectionsCallback();
    }
  }, [user, loadConnectionsCallback]);

  useEffect(() => {
    // Check for OAuth callback results
    const urlParams = new URLSearchParams(window.location.search);
    const successParam = urlParams.get('success');
    const errorParam = urlParams.get('error');

    if (successParam) {
      setSuccess(`Successfully connected to ${successParam}!`);
      window.history.replaceState({}, '', window.location.pathname);
      loadConnectionsCallback();
    } else if (errorParam) {
      setError(`Failed to connect to ${errorParam}. Please try again.`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [loadConnectionsCallback]);



  const handleConnect = async (integrationId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Timer is an internal service, no OAuth needed
      if (integrationId === 'timer') {
        // TODO: Open Timer configuration modal instead of OAuth flow
        setSuccess('Timer service is always available. Configure triggers in your workflows.');
        setIsLoading(false);
        return;
      }

      let authUrl: string;
      if (integrationId === 'discord') {
        const response = await integrationService.connectDiscord();
        authUrl = response.url;
      } else if (integrationId === 'github') {
        const response = await integrationService.connectGithub();
        authUrl = response.url;
      } else if (integrationId === 'reddit') {
        const response = await integrationService.connectReddit();
        authUrl = response.url;
      } else if (integrationId === 'spotify') {
        const response = await integrationService.connectSpotify();
        authUrl = response.url;
      } else if (integrationId === 'slack') {
        const response = await integrationService.connectSlack();
        authUrl = response.url;
      } else {
        throw new Error(`Unsupported integration: ${integrationId}`);
      }

      // Redirect to OAuth URL
      window.location.href = authUrl;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : `Failed to connect to ${integrationId}`;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await integrationService.disconnectService(integrationId);
      setSuccess(`Successfully disconnected from ${integrationId}`);
      loadConnectionsCallback();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : `Failed to disconnect from ${integrationId}`;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Intégrations</h1>
                <p className="mt-2 text-gray-600">
                  Connectez vos services favoris pour automatiser vos workflows
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Connecté en tant que <span className="font-medium text-gray-900">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Intégrations actives</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {integrations.filter(i => i.connected).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Workflows créés</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10l1 1v16l-1 1H6l-1-1V5l1-1z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Exécutions ce mois</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Integrations List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Services disponibles</h3>
              <p className="mt-1 text-sm text-gray-500">
                Connectez vos comptes pour commencer à automatiser vos workflows
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {integrations.map((integration) => (
                <div key={integration.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`${integration.color} shrink-0`}>
                        {integration.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900">
                            {integration.name}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {integration.description}
                        </p>
                        {integration.connected && integration.lastSync && (
                          <p className="text-xs text-gray-400 mt-2">
                            Dernière synchronisation: {new Date(integration.lastSync).toLocaleString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {integration.connected ? (
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Connecté
                          </p>
                          <button
                            onClick={() => handleDisconnect(integration.id)}
                            disabled={isLoading}
                            className="mt-1 text-xs text-red-600 hover:text-red-800 underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? 'Déconnexion...' : 'Se déconnecter'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConnect(integration.id)}
                          disabled={isLoading}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          {isLoading ? 'Connexion...' : 'Connecter'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Besoin d&apos;aide pour configurer vos intégrations ?
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Consultez notre documentation ou contactez notre équipe support pour vous aider à connecter vos services.
                  </p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <button className="bg-blue-50 px-2 py-1.5 rounded-md text-sm font-medium text-blue-800 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-50 focus:ring-blue-600">
                      Documentation
                    </button>
                    <button className="ml-3 bg-blue-50 px-2 py-1.5 rounded-md text-sm font-medium text-blue-800 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-50 focus:ring-blue-600">
                      Contacter le support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
