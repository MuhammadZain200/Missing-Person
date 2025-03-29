import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="text-center py-24 bg-white shadow-md">
        <h1 className="text-5xl font-extrabold mb-4 text-gray-800">
          Reuniting Families, One Report at a Time
        </h1>
        <p className="text-xl mb-6 text-gray-600 max-w-2xl mx-auto">
          Join our mission to bring missing loved ones home using advanced tools, AI search, and real-time reporting.
        </p>
        <div className="space-x-4">
          <Link to="/report">
            <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all shadow">
              Report a Missing Person
            </button>
          </Link>
          <Link to="/alerts">
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-all shadow">
              View Alerts
            </button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 md:px-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div>
          <h2 className="text-4xl font-bold text-blue-600">120+</h2>
          <p className="text-gray-600 text-lg">Reports Submitted</p>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-blue-600">45</h2>
          <p className="text-gray-600 text-lg">People Found</p>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-blue-600">8</h2>
          <p className="text-gray-600 text-lg">Volunteers Helping</p>
        </div>
      </section>

      {/* AI Search Prompt */}
      <section className="bg-white py-20 px-6 md:px-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Try AI-Powered Face Search</h2>
        <p className="text-gray-600 mb-6 text-lg max-w-2xl mx-auto">
          Upload a photo to find potential matches from our database of reported missing persons.
        </p>
        <Link to="/ai-search">
          <button className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-all shadow">
            Try AI Search
          </button>
        </Link>
      </section>

      {/* Featured Cases Grid */}
      <section className="py-20 px-6 md:px-16">
        <h2 className="text-3xl font-bold mb-10 text-center">Recent Missing Person Cases</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            { name: "John Doe", location: "New York City" },
            { name: "Jane Smith", location: "Los Angeles" },
            { name: "Carlos Ruiz", location: "Miami" },
          ].map((person, index) => (
            <div key={index} className="bg-white rounded shadow-md hover:shadow-xl transition p-5">
              <div className="bg-gray-200 h-40 mb-4 rounded" />
              <h3 className="font-semibold text-lg">{person.name}</h3>
              <p className="text-sm text-gray-500">Last seen: {person.location}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-100 py-20 px-6 md:px-16 text-center">
        <h2 className="text-3xl font-bold mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { step: 1, title: "Report", desc: "Submit missing person details securely." },
            { step: 2, title: "Search", desc: "Use built-in or AI-powered search tools." },
            { step: 3, title: "Stay Alert", desc: "Get updates and help spread the word." },
          ].map((item) => (
            <div key={item.step}>
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full mx-auto mb-4 text-2xl flex items-center justify-center">
                {item.step}
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-center py-8 border-t">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Missing Persons Finder. Built for Humanity.
        </p>
      </footer>
    </div>
  );
};

export default Home;
