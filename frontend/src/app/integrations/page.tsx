'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function IntegrationsCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [status, setStatus] = useState<'success' | 'error' | 'unknown'>('unknown');
  const [service, setService] = useState<string>('');

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    if (success) {
      setStatus('success');
      setService(success);
    } else if (error) {
      setStatus('error');
      setService(error);
    }
  }, [searchParams]);

  // Auto-redirect if authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && (status === 'success' || status === 'error')) {
      const timer = setTimeout(() => {
        router.push('/user/integrations');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, status, router]);

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case 'discord':
        return '🟦';
      case 'github':
        return '🐙';
      case 'reddit':
        return '🔶';
      case 'spotify':
        return '🎵';
      case 'slack':
        return '💬';
      default:
        return '🔗';
    }
  };

  const getServiceColor = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case 'discord':
        return 'indigo';
      case 'github':
        return 'gray';
      case 'reddit':
        return 'orange';
      case 'spotify':
        return 'green';
      case 'slack':
        return 'purple';
      default:
        return 'blue';
    }
  };

  if (status === 'unknown' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Chargement...</h2>
        </div>
      </div>
    );
  }

  const color = getServiceColor(service);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className={`rounded-lg shadow-lg p-8 text-center bg-white`}>
          <div className="text-6xl mb-6">
            {getServiceIcon(service)}
          </div>
          
          {status === 'success' ? (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Connexion réussie !</h1>
              <p className="text-gray-600 mb-8">
                Votre compte <span className="font-semibold capitalize">{service}</span> a été connecté avec succès.
                <br />
                Veuillez vous reconnecter pour voir vos intégrations.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur de connexion</h1>
              <p className="text-gray-600 mb-8">
                Une erreur s&apos;est produite lors de la connexion à <span className="font-semibold capitalize">{service}</span>.
                <br />
                Veuillez réessayer.
              </p>
            </>
          )}

          <div className="space-y-4">
            {isAuthenticated ? (
              <>
                <div className="mb-4 p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-800">
                    ✓ Vous êtes toujours connecté en tant que {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => router.push('/user/integrations')}
                  className={`inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors duration-200 ${
                    color === 'indigo' 
                      ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' 
                      : color === 'gray' 
                      ? 'bg-gray-900 hover:bg-gray-800 focus:ring-gray-500'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  Aller aux intégrations
                </button>
              </>
            ) : (
              <>
                <div className="mb-4 p-3 bg-amber-50 rounded-md">
                  <p className="text-sm text-amber-800">
                    ⚠️ Vous devez vous reconnecter pour accéder à vos intégrations
                  </p>
                </div>
                <Link
                  href="/login"
                  className={`inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors duration-200 ${
                    color === 'indigo' 
                      ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' 
                      : color === 'gray' 
                      ? 'bg-gray-900 hover:bg-gray-800 focus:ring-gray-500'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  Se reconnecter
                </Link>
              </>
            )}
            
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Retour à l&apos;accueil
            </Link>
          </div>

          {status === 'success' && (
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                💡 <strong>Astuce :</strong> {isAuthenticated 
                  ? "Redirection automatique vers vos intégrations..." 
                  : "Après vous être reconnecté, allez dans la section \"Intégrations\" pour voir votre nouveau service connecté."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
