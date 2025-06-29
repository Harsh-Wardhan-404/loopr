import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, BarChart3, AlertCircle, Check, X } from 'lucide-react';
import { authAPI } from '../services/api';
import type { SignupCredentials } from '../types';

interface PasswordValidation {
  minLength: boolean;
  hasNumber: boolean;
  hasLetter: boolean;
  hasSpecialChar: boolean;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupCredentials & { confirmPassword: string }>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password validation
  const validatePassword = (password: string): PasswordValidation => {
    return {
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasLetter: /[a-zA-Z]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  const passwordValidation = validatePassword(formData.password);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = formData.password === formData.confirmPassword;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!isPasswordValid) {
      setError('Please ensure your password meets all requirements.');
      setLoading(false);
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...signupData } = formData;
      const response = await authAPI.signup(signupData);
      
      // Store authentication data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = 
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    isPasswordValid &&
    passwordsMatch &&
    agreeToTerms;

  return (
    <div className="bg-black min-h-screen flex items-center justify-center py-12 px-4 text-white">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-[#2CFF05]" />
            </div>
            <span className="text-2xl font-bold text-white">Penta</span>
          </Link>
          <h2 className="text-3xl font-bold text-white">Create your account</h2>
          <p className="mt-2 text-gray-400">
            Join thousands of analysts using Penta
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-400">{error}</div>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="text-sm font-medium text-gray-400">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 mt-2 text-white focus:outline-none focus:ring-2 focus:ring-[#2CFF05]/50"
                  placeholder="John"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="text-sm font-medium text-gray-400">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 mt-2 text-white focus:outline-none focus:ring-2 focus:ring-[#2CFF05]/50"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-400">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 mt-2 text-white focus:outline-none focus:ring-2 focus:ring-[#2CFF05]/50"
                placeholder="john@company.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-400">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 mt-2 text-white focus:outline-none focus:ring-2 focus:ring-[#2CFF05]/50 pr-12"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="text-sm text-gray-400">Password must contain:</div>
                  <div className="space-y-1">
                    {Object.entries({
                      'At least 8 characters': passwordValidation.minLength,
                      'At least one number': passwordValidation.hasNumber,
                      'At least one letter': passwordValidation.hasLetter,
                      'At least one special character': passwordValidation.hasSpecialChar,
                    }).map(([requirement, isValid]) => (
                      <div key={requirement} className="flex items-center gap-2 text-sm">
                        {isValid ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        <span className={isValid ? 'text-green-400' : 'text-red-400'}>
                          {requirement}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-400">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 mt-2 text-white focus:outline-none focus:ring-2 focus:ring-[#2CFF05]/50 pr-12"
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && !passwordsMatch && (
                <p className="mt-2 text-sm text-red-400">Passwords do not match</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-[#2CFF05] focus:ring-[#2CFF05]/50"
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-400">
                I agree to the{' '}
                <a href="#" className="font-medium text-[#2CFF05] hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-[#2CFF05] hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className={`w-full py-3 px-4 rounded-md font-semibold text-center transition-colors
                ${loading || !isFormValid
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-[#2CFF05] text-black hover:bg-green-400'
                }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[#2CFF05] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup; 