import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { User, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export const RegisterScreen: React.FC = () => {
  const { register, navigate, goBack, loading, customization, currentUser } = useAppState();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      await register(fullName, email, password);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try another email.');
    }
  };

  const isOwner = currentUser?.role === 'owner';
  const accentColor = isOwner ? customization.primaryColor : '#22c55e';
  const customBtnColor = isOwner ? customization.btnColor : '#000000';

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col justify-between p-6 bg-white"
    >
      {/* Header with Back button */}
      <div className="flex items-center mt-2">
        <button 
          onClick={goBack} 
          className="p-1 px-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
      </div>

      <div className="text-center mt-4">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Create Account</h2>
        <p className="text-sm text-gray-500 mt-1">Fill in the details to register</p>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-[360px] mx-auto mt-6 w-full flex flex-col justify-center space-y-3.5">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Full Name" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50"
              required
            />
            <User className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</label>
          <div className="relative">
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50"
              required
            />
            <Mail className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Password</label>
          <div className="relative">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50"
              required
            />
            <Lock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Confirm Password</label>
          <div className="relative">
            <input 
              type="password" 
              placeholder="Confirm Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50"
              required
            />
            <Lock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          </div>
        </div>

        <button 
          id="register_submit_btn"
          type="submit"
          disabled={loading}
          className="w-full py-3 text-white font-semibold text-sm rounded-xl tracking-wide shadow-md transition-all active:scale-[0.98] mt-3"
          style={{ backgroundColor: customBtnColor }}
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      {/* Footer login link */}
      <div className="mb-4 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <button 
          onClick={() => navigate('login')}
          className="font-bold underline hover:text-gray-900 transition ml-1"
          style={{ color: accentColor }}
        >
          Login
        </button>
      </div>
    </motion.div>
  );
};
