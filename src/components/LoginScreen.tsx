import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { Mail, Lock, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

export const LoginScreen: React.FC = () => {
  const { login, navigate, loading, customization, currentUser } = useAppState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const isOwner = currentUser?.role === 'owner';
  const accentColor = isOwner ? customization.primaryColor : '#22c55e';
  const customBtnColor = isOwner ? customization.btnColor : '#000000';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col justify-between p-6 bg-white"
    >
      {/* Upper Logo / Title */}
      <div className="mt-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-green-50 flex items-center justify-center mb-4 border border-green-100">
          <Sparkles className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Welcome Back</h2>
        <p className="text-sm text-gray-500 mt-1">Please login to your account</p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-[360px] mx-auto mt-8 w-full flex flex-col justify-center space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
          <div className="relative">
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50"
              required
            />
            <Mail className="absolute left-3 top-3.5 text-gray-400 w-4.5 h-4.5" />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
            <button 
              type="button"
              onClick={() => alert(`Demo password reset: Any password works for local accounts! For registered accounts, standard login email configuration applies.`)}
              className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pl-10 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50"
              required
            />
            <Lock className="absolute left-3 top-3.5 text-gray-400 w-4.5 h-4.5" />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        <button 
          id="login_submit_btn"
          type="submit"
          disabled={loading}
          className="w-full py-3.5 text-white font-semibold text-sm rounded-xl tracking-wide shadow-md transition-all active:scale-[0.98]"
          style={{ backgroundColor: customBtnColor }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* Footer register link */}
      <div className="mb-4 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <button 
          onClick={() => navigate('register')}
          className="font-bold underline hover:text-gray-900 transition ml-1"
          style={{ color: accentColor }}
        >
          Register
        </button>
      </div>
    </motion.div>
  );
};
