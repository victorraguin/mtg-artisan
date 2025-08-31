import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'buyer' | 'creator'>('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signUp(email, password, displayName);
      if (error) throw error;
      
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://draftsim.com/wp-content/uploads/2022/05/Alseid-of-Lifes-Bounty-Illustration-by-Magali-Villeneuve.jpg"
          alt="MTG Fantasy Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/80"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
            <Sparkles className="h-10 w-10 text-purple-400" />
            <span className="text-2xl font-bold text-white">MTG Artisans</span>
          </Link>
          <h2 className="text-3xl font-bold text-white">Join our community</h2>
          <p className="mt-2 text-gray-400">
            Create an account to start buying or selling
          </p>
        </div>

        <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
              Display Name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 pr-10 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Choose your path:
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                role === 'buyer' 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  checked={role === 'buyer'}
                  onChange={(e) => setRole(e.target.value as 'buyer')}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-lg font-medium text-white">Collector</div>
                  <div className="text-sm text-gray-400">Commission legendary art</div>
                </div>
              </label>
              
              <label className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                role === 'creator' 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="creator"
                  checked={role === 'creator'}
                  onChange={(e) => setRole(e.target.value as 'creator')}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-lg font-medium text-white">Artisan</div>
                  <div className="text-sm text-gray-400">Craft magical services</div>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              'Create Account'
            )}
          </button>

          <div className="text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/auth/signin" className="text-purple-400 hover:text-purple-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}