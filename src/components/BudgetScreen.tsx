import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { ArrowLeft, Save, Wallet, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const BudgetScreen: React.FC = () => {
  const { setMonthlyBudget, activeMonth, budgets, goBack, customization, currentUser } = useAppState();

  const [selectedMonth, setSelectedMonth] = useState(activeMonth);
  
  // Find currently configured budget if any
  const existingBudget = budgets.find(b => b.month === selectedMonth)?.amount || '';
  const [budgetAmount, setBudgetAmount] = useState(existingBudget.toString());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sync amount field on month change
  const handleMonthChange = (val: string) => {
    setSelectedMonth(val);
    const mBudget = budgets.find(b => b.month === val)?.amount || '';
    setBudgetAmount(mBudget.toString());
    setSuccess(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const amtNum = parseFloat(budgetAmount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setError('Budget Amount must be a valid positive number.');
      return;
    }

    try {
      await setMonthlyBudget(selectedMonth, amtNum);
      setSuccess('Monthly budget limit updated successfully!');
      setTimeout(() => {
        goBack();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Error configuring budget.');
    }
  };

  const isOwner = currentUser?.role === 'owner';
  const accentColor = isOwner ? customization.primaryColor : '#22c55e';
  const customBtnColor = isOwner ? customization.btnColor : '#000000';

  const months = [
    { value: '2026-04', label: 'April 2026' },
    { value: '2026-05', label: 'May 2026' },
    { value: '2026-06', label: 'June 2026' },
    { value: '2026-07', label: 'July 2026' },
    { value: '2026-08', label: 'August 2026' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col justify-between p-6 bg-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between mt-2 mb-6">
        <button 
          onClick={goBack} 
          className="p-1 px-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Cancel
        </button>
        <h3 className="font-bold text-gray-900 text-sm">
          Set Monthly Budget
        </h3>
        <button 
          onClick={handleSave}
          className="text-xs font-bold text-green-600 hover:text-green-800 transition flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg border border-green-100"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>
      </div>

      <form onSubmit={handleSave} className="flex-1 space-y-5 max-w-[360px] mx-auto w-full flex flex-col justify-center">
        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto text-green-500 mb-2 border border-green-100">
          <Wallet className="w-7 h-7" />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-bold text-center">
            {success}
          </div>
        )}

        {/* Selected Month Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50 font-semibold text-gray-800"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Budget Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Budget Amount
          </label>
          <div className="relative">
            <input 
              type="number"
              placeholder="e.g. 25000"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50 font-bold"
              required
            />
          </div>
        </div>

        <button 
          id="budget_save_btn"
          type="submit"
          className="w-full py-3.5 text-white font-semibold text-sm rounded-xl tracking-wide shadow-md transition-all active:scale-[0.98] mt-4"
          style={{ backgroundColor: customBtnColor }}
        >
          Save
        </button>
      </form>

      {/* Role notice bottom (Step #11: "This budget is visible only to you and authorized users") */}
      <div className="mt-4 p-3 rounded-xl bg-green-50/50 border border-green-100 text-[10px] text-green-800 leading-relaxed font-semibold text-center">
        🛡️ This budget is visible only to you and authorized users.
      </div>
    </motion.div>
  );
};
