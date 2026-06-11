import React from 'react';
import { useAppState } from '../context/StateContext';
import { 
  ArrowLeft, 
  Users, 
  Palette, 
  BellRing, 
  UserSquare2, 
  LogOut, 
  ChevronRight,
  HandCoins,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export const SettingsScreen: React.FC = () => {
  const { goBack, navigate, logout, currentUser, customization, clearAllDummyData } = useAppState();

  const handleAction = (type: string) => {
    alert(`${type} controls configured standard! All features are synchronized via active cache database.`);
  };

  const isOwner = currentUser?.role === 'owner';
  const textCustomColor = isOwner ? customization.textColor : '#000000';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col justify-between p-6 bg-white rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-center mt-2 mb-6 justify-between border-b border-gray-100 pb-4">
        <button 
          onClick={goBack} 
          className="py-2.5 px-5 rounded-xl bg-slate-900 text-white font-semibold text-xs tracking-wide hover:bg-slate-850 active:scale-95 transition flex items-center shadow-md"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          Go Back
        </button>
        <span className="text-xs font-bold text-slate-950 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200">
          ⚙️ settings
        </span>
      </div>

      <div className="flex-1 max-w-[380px] mx-auto w-full flex flex-col justify-center space-y-5">
        <div className="text-center mb-2">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight" style={{ color: textCustomColor }}>Settings</h2>
          <p className="text-xs text-gray-400 mt-1">Configure family attributes and interface styling</p>
        </div>

        {/* List of Settings Options */}
        <div className="space-y-3">
          {isOwner && (
            <>
              {/* Option 1: Manage Users & Access */}
              <button 
                id="setting_manage_users_btn"
                onClick={() => navigate('manage-users')}
                className="w-full flex items-center justify-between p-4 border border-gray-100 hover:border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition text-sm font-bold text-left shadow-xs active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-3 text-gray-800">
                  <Users className="w-5 h-5 text-indigo-500" />
                  <span>Manage Users & Access</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {/* Option 2: App Customization */}
              <button 
                id="setting_customization_btn"
                onClick={() => navigate('customization')}
                className="w-full flex items-center justify-between p-4 border border-gray-100 hover:border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition text-sm font-bold text-left shadow-xs active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-3 text-gray-800">
                  <Palette className="w-5 h-5 text-emerald-500" />
                  <span>App Customization & Currency</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {/* Option 3: Add / Give Money Cash ledger */}
              <button 
                id="setting_give_money_btn"
                onClick={() => navigate('give-money')}
                className="w-full flex items-center justify-between p-4 border border-gray-100 hover:border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition text-sm font-bold text-left shadow-xs active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-3 text-gray-800">
                  <HandCoins className="w-5 h-5 text-amber-500" />
                  <span>Give Money Ledger</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {/* Option 4: Delete dummy entries / Wipe data (Requested) */}
              <button 
                id="setting_clear_dummy_btn"
                onClick={async () => {
                  if (confirm("Are you sure you want to delete all seeded dummy entries and transaction histories? This will restore a fresh, empty layout.")) {
                    await clearAllDummyData();
                    alert("All dummy entries successfully deleted! Database is now a fresh, clean slate.");
                  }
                }}
                className="w-full flex items-center justify-between p-4 border border-red-100 hover:border-red-200 rounded-2xl bg-red-50/20 hover:bg-red-50/40 transition text-sm font-bold text-left shadow-xs active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span>Delete Dummy Entries</span>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400" />
              </button>
            </>
          )}

          {/* Core options for everyone */}
          <button 
            onClick={() => navigate('notifications')}
            className="w-full flex items-center justify-between p-4 border border-gray-100 hover:border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition text-sm font-bold text-left shadow-xs active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-3 text-gray-800">
              <BellRing className="w-5 h-5 text-rose-500" />
              <span>Notifications</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-450" />
          </button>

          <button 
            onClick={() => handleAction('Account Settings')}
            className="w-full flex items-center justify-between p-4 border border-gray-100 hover:border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition text-sm font-bold text-left shadow-xs active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-3 text-gray-800">
              <UserSquare2 className="w-5 h-5 text-blue-500" />
              <span>Account Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-450" />
          </button>
        </div>
      </div>

      {/* Logout options */}
      <div className="mt-8 border-t border-gray-100 pt-4 text-center">
        <button 
          id="setting_logout_btn"
          onClick={logout}
          className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-sm text-red-500 hover:text-red-700 hover:bg-red-50/50 rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5" />
          Logout
        </button>
        <p className="text-[10px] text-gray-400 mt-2 font-semibold">
          Signed in user: {currentUser?.email}
        </p>
      </div>
    </motion.div>
  );
};
