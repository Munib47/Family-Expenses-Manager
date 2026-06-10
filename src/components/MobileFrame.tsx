import React from 'react';
import { useAppState } from '../context/StateContext';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const { customization, currentUser, firebaseMode } = useAppState();

  // Determine if owner custom styles apply
  const isOwner = currentUser?.role === 'owner';
  
  const themeStyles = isOwner ? {
    backgroundColor: customization.bgColor,
    color: customization.textColor,
  } : {};

  return (
    <div className="min-h-screen bg-[#0f172a] bg-gradient-to-br from-indigo-950 via-slate-900 to-teal-950 py-8 px-4 sm:px-6 md:px-8 font-sans transition-colors duration-300 relative flex flex-col items-center justify-between">
      {/* Premium Glass Blob Decorators */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Visual Workspace Branding Header */}
      <header className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 z-10">
        <div className="text-center sm:text-left">
          <h1 className="text-white font-bold text-2xl sm:text-3xl tracking-tight">
            Family Expense Manager
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time financial synchronization for your household
          </p>
        </div>
        <div className="bg-slate-800/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-3">
          <span className="text-xs text-slate-300">Firebase Sync:</span>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${firebaseMode === 'firebase' ? 'text-teal-400' : 'text-amber-400'}`}>
            <span className={`w-2 h-2 rounded-full ${firebaseMode === 'firebase' ? 'bg-teal-400' : 'bg-amber-400'} animate-pulse`} />
            {firebaseMode === 'firebase' ? 'Cloud RTDB' : 'Sandbox Cache'}
          </span>
        </div>
      </header>

      {/* Main Responsive Web App Container Card */}
      <main 
        className="w-full max-w-5xl bg-white/5 backdrop-blur-md rounded-3xl border border-white/15 shadow-2xl overflow-hidden transition-all duration-300 z-10 flex-grow flex flex-col p-4 sm:p-6 md:p-8 mb-6"
        style={themeStyles}
        id="phone_view_container"
      >
        <div className="flex-grow flex flex-col">
          {children}
        </div>
      </main>

      <footer className="w-full max-w-5xl mx-auto text-center z-10">
        <p className="text-slate-500 text-xs">
          Role Access: <strong className="text-slate-300">owner@example.com</strong> (Family Owner) | Registered users sign in with their email.
        </p>
      </footer>
    </div>
  );
};
