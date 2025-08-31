import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const testAccounts = [
    { email: 'admin@mtgartisans.com', password: 'admin123!', role: 'Admin' },
    { email: 'alice@artmaster.com', password: 'alice123!', role: 'Creator' },
    { email: 'bob@tokencraft.com', password: 'bob123!', role: 'Creator' },
    { email: 'collector@mtg.com', password: 'collector123!', role: 'Buyer' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      if (error.message?.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please check your credentials.');
      } else {
        toast.error(error.message || 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillTestAccount = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://draftsim.com/wp-content/uploads/2022/06/Briarhorn-Illustration-by-Nils-Hamm-1024x759.jpg"
          alt="MTG Fantasy Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/80"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
            <Sparkles className="h-10 w-10 text-purple-400" />
            <span className="text-2xl font-bold text-white font-display">MTG Artisans</span>
          </Link>
          <h2 className="text-3xl font-bold text-white font-display">Welcome back, Planeswalker</h2>
          <p className="mt-2 text-gray-400">
            Enter your guild credentials to access the multiverse
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
                placeholder="Enter your password"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              'Sign In'
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowTestAccounts(!showTestAccounts)}
              className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
            >
              {showTestAccounts ? 'Hide' : 'Show'} test accounts
            </button>
          </div>

          {showTestAccounts && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-300 mb-3">Test accounts:</p>
              {testAccounts.map((account, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => fillTestAccount(account.email, account.password)}
                  className="w-full text-left p-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  <div className="text-sm text-white">{account.email}</div>
                  <div className="text-xs text-gray-400">{account.role}</div>
                </button>
              ))}
            </div>
          )}

          <div className="text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/auth/signup" className="text-purple-400 hover:text-purple-300 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}