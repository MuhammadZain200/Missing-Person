import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="text-center py-20 bg-white shadow-md">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Missing Persons, Bring Them Home</h1>
        <p className="text-lg md:text-xl mb-6 text-gray-600">Join our mission to reunite families using powerful tools and AI assistance.</p>
        <Link to="/report">
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold">
            Report a Missing Person
          </button>
        </Link>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 md:px-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div>
          <h2 className="text-3xl font-bold text-blue-600">120+</h2>
          <p className="text-gray-600">Reports Submitted</p>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-blue-600">45</h2>
          <p className="text-gray-600">People Found</p>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-blue-600">8</h2>
          <p className="text-gray-600">Volunteers Actively Helping</p>
        </div>
      </section>

      {/* AI Search Prompt */}
      <section className="bg-white py-16 px-4 md:px-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Try AI-Powered Face Search</h2>
        <p className="text-gray-600 mb-6">Upload a photo to find matches from our database of reported cases.</p>
        <Link to="/ai-search">
          <button className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg">
            Try AI Search
          </button>
        </Link>
      </section>

      {/* Featured Cases Grid (placeholder for now) */}
      <section className="py-16 px-4 md:px-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Recent Missing Person Cases</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div className="bg-white rounded shadow p-4">
            <div className="bg-gray-200 h-40 mb-4"></div>
            <h3 className="font-semibold">John Doe</h3>
            <p className="text-sm text-gray-500">Last seen: New York City</p>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="bg-gray-200 h-40 mb-4"></div>
            <h3 className="font-semibold">Jane Smith</h3>
            <p className="text-sm text-gray-500">Last seen: Los Angeles</p>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="bg-gray-200 h-40 mb-4"></div>
            <h3 className="font-semibold">Carlos Ruiz</h3>
            <p className="text-sm text-gray-500">Last seen: Miami</p>
          </div>
        </div>
      </section>

      {/* How It Works (Optional for now) */}
      <section className="bg-gray-100 py-16 px-4 md:px-16 text-center">
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full mx-auto mb-4 text-2xl flex items-center justify-center">1</div>
            <h3 className="font-semibold mb-2">Report</h3>
            <p className="text-gray-600">Submit missing person details securely.</p>
          </div>
          <div>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full mx-auto mb-4 text-2xl flex items-center justify-center">2</div>
            <h3 className="font-semibold mb-2">Search</h3>
            <p className="text-gray-600">Search or use AI-powered tools to assist.</p>
          </div>
          <div>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full mx-auto mb-4 text-2xl flex items-center justify-center">3</div>
            <h3 className="font-semibold mb-2">Stay Alert</h3>
            <p className="text-gray-600">Get real-time updates and contribute.</p>
          </div>
        </div>
      </section>

      {/* Footer Preview */}
      <footer className="bg-white text-center py-6 border-t">
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} Missing Persons Finder. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
