'use client'; // Si tu es en app router

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface Connection {
  id: number;
  serviceName: string;
  connected: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Integrations() {
  const searchParams = useSearchParams();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Récupérer le token JWT (adapte selon ton système d'auth)
  const getToken = () => {
    return localStorage.getItem('token'); // ou ton système d'auth
  };

  // Charger les connexions existantes
  const loadConnections = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch('http://localhost:8084/connections', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConnections(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Connecter Discord
  const connectDiscord = async () => {
    try {
      const token = getToken();
      if (!token) {
        setMessage('Vous devez être connecté');
        return;
      }

      const response = await fetch('http://localhost:8084/oauth/discord', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur lors de la connexion à Discord');
    }
  };

  // Connecter GitHub
  const connectGithub = async () => {
    try {
      const token = getToken();
      if (!token) {
        setMessage('Vous devez être connecté');
        return;
      }

      const response = await fetch('http://localhost:8084/oauth/github', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur lors de la connexion à GitHub');
    }
  };

  // Déconnecter un service
  const disconnect = async (serviceName: string) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`http://localhost:8084/connections/${serviceName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage(`${serviceName} déconnecté`);
        loadConnections();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  useEffect(() => {
    // Afficher message de succès/erreur après redirection OAuth
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      setMessage(` ${success} connecté avec succès!`);
    } else if (error) {
      setMessage(`Erreur lors de la connexion à ${error}`);
    }

    loadConnections();
  }, [searchParams]);

  const isConnected = (serviceName: string) => {
    return connections.some(c => c.serviceName === serviceName);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center rounded-full bg-cyan-500/10 border border-cyan-500/20 px-6 py-3 text-sm font-medium text-cyan-400">
              <span className="mr-2 h-2 w-2 rounded-full bg-cyan-500"></span>
              New: Mobile App Available
            </div>

            {/* Main Heading */}
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Connect Your Apps with{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Chad Area
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mb-12 max-w-2xl text-xl text-gray-300 sm:text-xl leading-relaxed">
              Create powerful automations between your favorite services. Save time and boost productivity with custom workflows that work seamlessly.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {/* <Link
                href="/login"
                className="inline-flex items-center rounded-lg bg-cyan-500 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 transform hover:scale-105"
              >
                Get Started Free
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center rounded-lg border-2 border-cyan-500/30 bg-transparent px-8 py-4 text-lg font-semibold text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200"
              >
                Learn More
              </Link> */}
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-cyan-400">100+</div>
                <div className="text-sm text-gray-400 mt-2">Integrations</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-cyan-400">50K+</div>
                <div className="text-sm text-gray-400 mt-2">Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-cyan-400">1M+</div>
                <div className="text-sm text-gray-400 mt-2">Automations</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-cyan-400">99.9%</div>
                <div className="text-sm text-gray-400 mt-2">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Why Choose Chad Area?
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to automate your workflows and boost productivity.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-lg bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Lightning Fast</h3>
              <p className="mt-2 text-gray-600">
                Set up automations in minutes, not hours. Our intuitive interface makes it easy.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-100">
                <svg className="h-6 w-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Secure & Reliable</h3>
              <p className="mt-2 text-gray-600">
                Enterprise-grade security with 99.9% uptime guarantee. Your data is safe with us.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-100">
                <svg className="h-6 w-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Easy to Use</h3>
              <p className="mt-2 text-gray-600">
                No coding required. Build complex automations with our drag-and-drop interface.
              </p>
            </div>
          </div>

          {isConnected('github') ? (
            <button
              onClick={() => disconnect('github')}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Déconnecter
            </button>
          ) : (
            <button
              onClick={connectGithub}
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
            >
              Connecter GitHub
            </button>
          )}
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="bg-primary-600 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Take Chad Area Everywhere
          </h2>
          <p className="mt-4 text-xl text-primary-100">
            Download our mobile app and manage your automations on the go.
          </p>

          <div className="mt-8">
            <a
              href="/app-release.apk"
              download="chad-area.apk"
              className="inline-flex items-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-primary-600 shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 transition-all duration-200"
            >
              <svg className="mr-3 h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106" />
              </svg>
              Download Android App
            </a>
          </div>

          <p className="mt-4 text-sm text-primary-200">
            Available for Android devices. iOS coming soon!
          </p>
        </div>
      </section>
    </div>
  );
}