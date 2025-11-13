export default function Services() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center rounded-full bg-cyan-500/10 border border-cyan-500/20 px-6 py-3 text-sm font-medium text-cyan-400">
            <span className="mr-2 h-2 w-2 rounded-full bg-cyan-500"></span>
            Premium Automation Services
          </div>
          <h1 className="text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
            Our <span className="text-cyan-400">Services</span>
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive workflow automation solutions designed to streamline your business 
            processes and boost productivity.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 hover:shadow-md transition-shadow duration-300">
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-cyan-100 mb-6">
                <svg className="h-8 w-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">App Integrations</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Connect your favorite apps and services seamlessly. Build powerful workflows that 
                work across platforms automatically.
              </p>
              <ul className="text-gray-600 space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></span>
                  500+ App Connections
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></span>
                  Real-time Sync
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></span>
                  Custom API Support
                </li>
              </ul>
            </div>
            
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 hover:shadow-md transition-shadow duration-300">
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 mb-6">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Smart Automation</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Intelligent automation that learns from your patterns and adapts to optimize 
                your workflows over time.
              </p>
              <ul className="text-gray-600 space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  AI-Powered Triggers
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Conditional Logic
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Multi-step Workflows
                </li>
              </ul>
            </div>
            
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 hover:shadow-md transition-shadow duration-300">
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-pink-100 mb-6">
                <svg className="h-8 w-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Analytics & Insights</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Get detailed insights into your automation performance and discover opportunities 
                for further optimization.
              </p>
              <ul className="text-gray-600 space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                  Performance Metrics
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                  Usage Analytics
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                  Cost Optimization
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Automate Your Workflow?</h2>
          <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already saving time and increasing productivity with Chad Area.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-cyan-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 transform hover:scale-105">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-cyan-600 transition-all duration-200">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
