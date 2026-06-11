import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/StateContext';
import { ArrowLeft, Save, Calendar, Landmark, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const AddEditExpenseScreen: React.FC = () => {
  const { 
    addExpense, 
    editExpense, 
    expenses, 
    goBack, 
    currentScreenParams, 
    activeMonth,
    customization,
    currentUser,
    getCurrencySymbol
  } = useAppState();

  const editId = currentScreenParams?.editId;
  const isEdit = !!editId;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => {
    // Return standard formatted date
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const existing = expenses.find(e => e.id === editId);
      if (existing) {
        setTitle(existing.title);
        setAmount(existing.amount.toString());
        setDate(existing.date);
        setDetails(existing.details || '');
      }
    }
  }, [isEdit, editId, expenses]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !amount) {
      setError('Please fill in required fields (Title, Amount).');
      return;
    }

    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setError('Amount must be a valid positive number.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit) {
        await editExpense(editId, {
          title,
          amount: amtNum,
          date,
          details
        });
      } else {
        await addExpense({
          title,
          amount: amtNum,
          date,
          details
        });
      }
      goBack();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
      setIsSubmitting(false);
    }
  };

  const isOwner = currentUser?.role === 'owner';
  const customBtnColor = isOwner ? customization.btnColor : '#000000';

  if (isSubmitting) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white p-6">
        <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-indigo-500 border-r-teal-500 border-b-green-500 animate-spin" />
        <span className="text-sm text-slate-600 font-semibold mt-4">
          {isEdit ? 'Updating expense...' : 'Saving expense...'}
        </span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col justify-between p-6 bg-white"
    >
      {/* Header with Save text indicator */}
      <div className="flex items-center justify-between mt-2 mb-6">
        <button 
          onClick={goBack} 
          className="py-2 px-4 rounded-xl bg-slate-900 text-white font-semibold text-xs tracking-wide hover:bg-slate-850 active:scale-95 transition flex items-center shadow-lg hover:shadow-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          Go Back
        </button>
        <h3 className="font-bold text-gray-950 text-sm">
          {isEdit ? 'Edit Expense' : 'Add Expense'}
        </h3>
        <button 
          onClick={handleSave}
          className="text-xs font-bold text-green-600 hover:text-green-800 transition flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg border border-green-100"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>
      </div>

      <form onSubmit={handleSave} className="flex-1 space-y-4 max-w-[360px] mx-auto w-full flex flex-col justify-center">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Title Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Title
          </label>
          <div className="relative">
            <input 
              type="text"
              placeholder="e.g., Grocery, Electricity Bill"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50 font-medium"
            />
          </div>
        </div>

        {/* Amount Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Amount ({getCurrencySymbol(currentUser?.uid)})
          </label>
          <div className="relative">
            <input 
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50 font-bold"
            />
          </div>
        </div>

        {/* Date Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Date
          </label>
          <div className="relative">
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50 font-medium text-gray-600"
            />
          </div>
        </div>

        {/* Details Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Details
          </label>
          <textarea 
            placeholder="Enter additional details (weekly grocery setup, wifi billing, etc.)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50 h-24 resize-none font-medium text-gray-600"
          />
        </div>

        <button 
          id="expense_save_btn"
          type="button"
          onClick={handleSave}
          className="w-full py-3.5 bg-black text-white font-semibold text-sm rounded-xl tracking-wide shadow-md transition-all active:scale-[0.98] mt-4 z-10 relative"
        >
          {isEdit ? 'Update Expense' : 'Save Expense'}
        </button>
      </form>

      <div className="mt-4 text-center text-[10px] text-gray-400 font-medium">
        Active Billing Period: <strong className="text-gray-600">{activeMonth}</strong>
      </div>
    </motion.div>
  );
};
