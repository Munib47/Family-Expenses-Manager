import React from 'react';
import { useAppState } from '../context/StateContext';
import { Landmark, ShoppingCart, Settings, Users, LogOut, ShieldAlert, BellRing } from 'lucide-react';
import { motion } from 'motion/react';

export const ChooseOptionScreen: React.FC = () => {
  const { currentUser, logout, navigate, setActiveFlow, customization } = useAppState();

  const handleSelectFlow = (flow: 'expense' | 'buy') => {
    setActiveFlow(flow);
    navigate('select-month');
  };

  const isOwner = currentUser?.role === 'owner';
  const textCustomColor = isOwner ? customization.textColor : '#000000';
  const customBtnColor = isOwner ? customization.btnColor : '#000000';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col justify-between p-6 bg-white"
    >
      {/* Top Welcome Title */}
      <div className="mt-4 flex justify-between items-start">
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Member</span>
          <h2 className="text-xl font-bold text-gray-900 mt-0.5" style={{ color: textCustomColor }}>
            Hello, {currentUser?.fullName || 'Family User'}
          </h2>
          <p className="text-xs text-gray-500">{currentUser?.role === 'owner' ? '👑 Account Owner' : '👥 Family Member'}</p>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold transition shadow-sm text-xs"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 stroke-[2.5]" />
          Logout
        </button>
      </div>

      <div className="my-auto space-y-6 max-w-[360px] mx-auto w-full">
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900">Choose an option</h3>
          <p className="text-xs text-gray-500 mt-1">Select what you want to do</p>
        </div>

        {/* Action Button Blocks */}
        <div className="space-y-4">
          {/* Expense Management */}
          <button 
            id="option_expense_btn"
            onClick={() => handleSelectFlow('expense')}
            className="w-full flex items-center p-4 border border-gray-100 rounded-2xl bg-white hover:bg-gray-50 hover:border-green-300 shadow-sm transition-all text-left group active:scale-[0.99]"
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center mr-4 group-hover:bg-green-100 transition-colors">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Expense Management</h4>
              <p className="text-xs text-gray-500 mt-0.5">Track daily bills, groceries, and balances</p>
            </div>
          </button>

          {/* Want to Buy */}
          <button 
            id="option_buy_btn"
            onClick={() => handleSelectFlow('buy')}
            className="w-full flex items-center p-4 border border-gray-100 rounded-2xl bg-white hover:bg-gray-50 hover:border-blue-300 shadow-sm transition-all text-left group active:scale-[0.99]"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Want to Buy</h4>
              <p className="text-xs text-gray-500 mt-0.5">Collaborative grocery and wishlist todo list</p>
            </div>
          </button>
        </div>
      </div>

      {/* Owner-Specific Foot Control Links */}
      {isOwner ? (
        <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-2">Owner Controls</h4>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => navigate('manage-users')}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition"
            >
              <Users className="w-3.5 h-3.5" />
              Users
            </button>
            <button 
              onClick={() => navigate('notifications')}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition"
            >
              <BellRing className="w-3.5 h-3.5" />
              Alerts
            </button>
            <button 
              onClick={() => navigate('settings')}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
          </div>
        </div>
      ) : (
        // Authorized user quick indicators
        currentUser?.permissions?.addBudget && (
          <div className="text-center">
            <button 
              onClick={() => navigate('settings')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-600 transition"
            >
              <Settings className="w-3.5 h-3.5" />
              Member Toolbar
            </button>
          </div>
        )
      )}
    </motion.div>
  );
};
