import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Shield, Download, TrendingUp, Users, DollarSign, Calendar, Filter } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="auth-page min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Penta Analytics</h1>
            </div>
            <div className="flex gap-4">
              <Link to="/login" className="btn btn-secondary">
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Advanced Financial Analytics for
              <span className="text-blue-600"> Modern Businesses</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Empower your financial analysts with comprehensive transaction tracking, 
              interactive dashboards, and powerful insights. Make data-driven decisions 
              with confidence.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/signup" className="btn btn-primary text-lg px-8 py-4">
                Start Free Trial
              </Link>
              <Link to="/login" className="btn btn-secondary text-lg px-8 py-4">
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need for financial analysis
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed specifically for financial analysts 
              and business intelligence teams.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="feature-icon">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Interactive Dashboards
              </h3>
              <p className="text-gray-600">
                Real-time visualizations with customizable charts and graphs. 
                Track income, expenses, and trends with beautiful, responsive dashboards.
              </p>
            </div>

            <div className="text-center">
              <div className="feature-icon">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Advanced Filtering
              </h3>
              <p className="text-gray-600">
                Powerful search and filter capabilities. Sort by date, amount, category, 
                status, and more to find exactly what you need.
              </p>
            </div>

            <div className="text-center">
              <div className="feature-icon">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                CSV Export
              </h3>
              <p className="text-gray-600">
                Export your data with flexible options. Choose columns, apply filters, 
                and generate professional reports for external analysis.
              </p>
            </div>

            <div className="text-center">
              <div className="feature-icon">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Financial Analytics
              </h3>
              <p className="text-gray-600">
                Deep insights into your financial data. Track performance metrics, 
                identify trends, and make informed business decisions.
              </p>
            </div>

            <div className="text-center">
              <div className="feature-icon">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Team Collaboration
              </h3>
              <p className="text-gray-600">
                Secure user management with role-based access. Perfect for 
                financial teams and collaborative analysis workflows.
              </p>
            </div>

            <div className="text-center">
              <div className="feature-icon">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Enterprise Security
              </h3>
              <p className="text-gray-600">
                Bank-level security with JWT authentication and encrypted data storage. 
                Your financial data is always protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by financial professionals
            </h2>
          </div>

          <div className="grid grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">$2.1M+</div>
              <div className="text-gray-600">Transactions Tracked</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
              <div className="text-gray-600">Active Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime Guarantee</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Expert Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to transform your financial analysis?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of financial professionals who trust Penta Analytics 
            for their business intelligence needs.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/signup" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link 
              to="/login" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Penta Analytics</span>
            </div>
            <div className="text-gray-400">
              © 2024 Penta Analytics. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 