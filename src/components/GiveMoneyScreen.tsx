import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { ArrowLeft, Save, Sparkles, User, AlertCircle, TrendingUp, HandCoins, BookOpen, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';

export const GiveMoneyScreen: React.FC = () => {
  const { 
    addGiveMoneyTransaction, 
    giveMoneyTransactions, 
    users, 
    goBack, 
    customization,
    currentUser,
    budgets,
    getCurrencySymbol
  } = useAppState();

  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter out ourselves (or just display all family-members)
  const availableUsers = users.filter(u => u.role !== 'owner');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedUser || !amount || !purpose) {
      setError('Please fill in all fields (Select User, Amount, Purpose).');
      return;
    }

    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setError('Amount must be a valid positive number.');
      return;
    }

    try {
      await addGiveMoneyTransaction(selectedUser, amtNum, purpose, date);
      setSuccess('Transaction logged successfully!');
      
      // Reset form
      setSelectedUser('');
      setAmount('');
      setPurpose('');
    } catch (err: any) {
      setError(err.message || 'Error logging give money transaction.');
    }
  };

  const isOwner = currentUser?.role === 'owner';
  const customPrimary = isOwner ? customization.primaryColor : '#22c55e';
  const customBtnColor = isOwner ? customization.btnColor : '#000000';

  // Format historical ledger items: Given Money transactions combined with Budget Set log items 
  // (to match screen 13: "Given to Ali", "Given to Sara", "Budget Set: ₹25,000.00")
  const ledgerItems: Array<{
    id: string;
    type: 'spend' | 'budget';
    title: string;
    subtitle: string;
    details: string;
    amount: number;
    date: string;
  }> = [];

  // Add give money records
  giveMoneyTransactions.forEach(tx => {
    ledgerItems.push({
      id: tx.id,
      type: 'spend',
      title: `Given to ${tx.userName}`,
      subtitle: tx.purpose,
      details: `Help for ${tx.purpose.toLowerCase()}`,
      amount: tx.amount,
      date: tx.date
    });
  });

  // Add Budget Set records
  budgets.forEach(b => {
    ledgerItems.push({
      id: `b_${b.month}`,
      type: 'budget',
      title: 'Budget Set',
      subtitle: `${b.month === '2026-06' ? 'June 2026' : b.month}`,
      details: b.month === '2026-06' ? 'June 2026' : b.month,
      amount: b.amount,
      date: `${b.month}-01`
    });
  });

  // Sort by date descending
  const sortedLedger = ledgerItems.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col p-5 bg-white overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mt-2 mb-6">
        <button 
          onClick={goBack} 
          className="py-2.5 px-5 rounded-xl bg-slate-900 text-white font-semibold text-xs tracking-wide hover:bg-slate-800 active:scale-95 transition flex items-center shadow-lg hover:shadow-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          Go Back
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-sm border border-emerald-400">
          <BookOpen className="w-4 h-4 text-white" />
          <span className="text-xs font-bold text-white tracking-wide">
            Give Money Ledger
          </span>
        </div>
      </div>

      {/* Part 1: Hand / Give Money Form */}
      <div className="border border-gray-100 rounded-2xl p-5 bg-white shadow-md mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
        <h3 className="font-extrabold text-gray-900 text-lg mb-4 flex items-center gap-2">
          <HandCoins className="w-6 h-6 text-green-500" />
          Add / Give Money
        </h3>

        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-250 text-red-650 text-xs flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-2.5 rounded-xl bg-green-50 border border-green-250 text-green-750 text-xs font-bold text-center mb-3">
            {success}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3.5">
          {/* Select User dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Select User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-180 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-green-500/20 bg-gray-50/70 text-gray-800 font-semibold"
              required
            >
              <option value="">-- Choose Member --</option>
              {availableUsers.map(u => (
                <option key={u.uid} value={u.uid}>{u.fullName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Amount */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Amount (PKR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">PKR</span>
                <input 
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-gray-50/50 font-bold text-gray-900 transition"
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Date</label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-gray-50/50 font-semibold text-gray-800 transition"
                required
              />
            </div>
          </div>

          {/* Purpose details */}
          <div className="pt-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Purpose / Details</label>
            <input 
              type="text"
              placeholder="e.g. Help for groceries, transport"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-gray-50/50 font-semibold text-gray-800 transition"
              required
            />
          </div>

          <div className="pt-2">
            <button 
              id="give_money_submit"
              type="submit"
              className="w-full py-3.5 bg-black text-white font-extrabold text-sm rounded-xl tracking-wide shadow-md hover:shadow-lg transition active:scale-[0.98] uppercase flex justify-center items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Transaction
            </button>
          </div>
        </form>
      </div>

      {/* Part 2: All Transactions / Given Money */}
      <div className="rounded-2xl p-5 bg-black/80 backdrop-blur-md border border-gray-800 shadow-xl mt-2">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-400" />
            All Transactions
          </h3>
          <span className="text-xs font-bold text-indigo-200 bg-indigo-900/50 border border-indigo-700/50 px-3 py-1 rounded-full select-none shadow-xs">
            {sortedLedger.length} Records
          </span>
        </div>

        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
          {sortedLedger.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-6">No cash assignments recorded.</p>
          ) : (
            sortedLedger.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-2.5 bg-black/40 border border-gray-700/50 rounded-xl hover:border-gray-600 transition"
              >
                <div>
                  <h4 className="font-bold text-gray-100 text-[11px] flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.type === 'budget' ? 'bg-indigo-400' : 'bg-green-400'}`} />
                    {item.title}
                  </h4>
                  <p className="text-[9px] text-gray-400 mt-0.5 italic">
                    {item.subtitle}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-white block">
                    PKR {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5 font-medium">
                    {new Date(item.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="text-center mt-5">
          <button 
            type="button"
            onClick={() => alert('Viewing complete consolidated account: showing both family expense limits and member direct allowance logs.')}
            className="w-full py-2.5 text-xs text-indigo-300 hover:text-white hover:bg-indigo-600 transition font-bold bg-white/10 border border-indigo-500/30 rounded-xl shadow-sm"
          >
            View All Transactions
          </button>
        </div>
      </div>
    </motion.div>
  );
};
