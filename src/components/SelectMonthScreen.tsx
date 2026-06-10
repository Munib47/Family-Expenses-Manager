import React from 'react';
import { useAppState } from '../context/StateContext';
import { ArrowLeft, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export const SelectMonthScreen: React.FC = () => {
  const state = useAppState();
  const { goBack, activeMonth, setActiveMonth, activeFlow, navigate, currentUser } = state;

  const months = [
    { value: '2026-04', label: 'April 2026' },
    { value: '2026-05', label: 'May 2026' },
    { value: '2026-06', label: 'June 2026' },
    { value: '2026-07', label: 'July 2026' },
    { value: '2026-08', label: 'August 2026' },
  ];

  // Instantly select of month and redirect
  const handleSelectMonth = (monthVal: string) => {
    state.setActiveMonth(monthVal);
    if (state.activeFlow === 'expense') {
      state.navigate('expense-list');
    } else {
      state.navigate('want-to-buy');
    }
  };

  const isOwner = state.currentUser?.role === 'owner';

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col justify-between p-6 bg-white rounded-2xl"
    >
      {/* Header with Prominent Back button */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <button 
          onClick={state.goBack} 
          className="py-2.5 px-5 rounded-xl bg-slate-900 text-white font-semibold text-xs tracking-wide hover:bg-slate-850 active:scale-95 transition flex items-center shadow-lg hover:shadow-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          Go Back
        </button>
        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
          Step 2: Period List
        </span>
      </div>

      <div className="text-center mt-2 mb-6">
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Select Month</h3>
        <p className="text-xs text-gray-500 mt-1.5">Click any month below to instantly open your budget profile</p>
      </div>

      {/* Choice Listing with instant-routing */}
      <div className="flex-1 my-2 space-y-3 flex flex-col justify-center max-w-[400px] mx-auto w-full">
        {months.map((m) => {
          const isSelected = state.activeMonth === m.value;
          return (
            <button
              key={m.value}
              onClick={() => handleSelectMonth(m.value)}
              className={`w-full flex items-center justify-between p-4.5 border-2 rounded-2xl transition-all duration-200 text-sm font-bold text-left hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                isSelected 
                  ? 'border-teal-500 bg-teal-50/20 text-teal-950 shadow-sm' 
                  : 'border-slate-100 hover:border-slate-350 text-slate-700 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={isSelected ? 'text-teal-600 font-extrabold' : 'text-slate-800'}>
                  {m.label}
                </span>
              </div>
              <Calendar className={`w-5 h-5 ${isSelected ? 'text-teal-500' : 'text-slate-400'}`} />
            </button>
          );
        })}
      </div>

      <div className="mt-8 pt-4 border-t border-gray-150 text-center">
        <p className="text-[11px] text-gray-400">
          Flow: {state.activeFlow === 'expense' ? 'Expense Management Toolbar' : 'Want to Buy Items List'}
        </p>
      </div>
    </motion.div>
  );
};
