export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
            About <span className="text-cyan-400">Chad Area</span>
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto">
            Revolutionizing workflow automation to help businesses and individuals 
            achieve more with less effort.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-2">
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center rounded-full bg-cyan-100 px-4 py-2 text-sm font-medium text-cyan-700 mb-6">
                <span className="mr-2 h-2 w-2 rounded-full bg-cyan-500"></span>
                Our Mission
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Simplifying Complex Workflows
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                We believe that technology should work for you, not against you. Our mission is to 
                create intuitive automation tools that eliminate repetitive tasks, reduce human error, 
                and free up time for what matters most - creative and strategic work.
              </p>
            </div>
            
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 mb-6">
                <span className="mr-2 h-2 w-2 rounded-full bg-blue-500"></span>
                Our Vision
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                A Connected Digital Future
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                We envision a world where all digital tools work seamlessly together, where 
                information flows effortlessly between platforms, and where every business, 
                regardless of size, can leverage the power of intelligent automation.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="bg-gray-50 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">Our Core Values</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide every decision we make and every solution we create.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow duration-300">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-cyan-100 mb-6">
                <svg className="h-8 w-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-600 leading-relaxed">
                Constantly pushing the boundaries of what's possible with technology, 
                creating cutting-edge solutions for tomorrow's challenges.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow duration-300">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 mb-6">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Excellence</h3>
              <p className="text-gray-600 leading-relaxed">
                Delivering exceptional quality in every aspect of our work, from code 
                architecture to customer support and user experience design.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow duration-300">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-pink-100 mb-6">
                <svg className="h-8 w-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Empathy</h3>
              <p className="text-gray-600 leading-relaxed">
                Understanding our users' needs deeply and creating solutions that 
                truly make their lives easier and more productive.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
