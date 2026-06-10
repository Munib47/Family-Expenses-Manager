import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { ArrowLeft, Save, Sparkles, User, AlertCircle, TrendingUp, HandCoins } from 'lucide-react';
import { motion } from 'motion/react';

export const GiveMoneyScreen: React.FC = () => {
  const { 
    addGiveMoneyTransaction, 
    giveMoneyTransactions, 
    users, 
    goBack, 
    customization,
    currentUser,
    budgets
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
      <div className="flex items-center justify-between mt-2 mb-4">
        <button 
          onClick={goBack} 
          className="p-1 px-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <span className="text-xs font-bold text-gray-900 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
          💸 Give Money Ledger
        </span>
      </div>

      {/* Part 1: Hand / Give Money Form (Step #12) */}
      <div className="border border-gray-100 rounded-2xl p-4 bg-white shadow-xs mb-5">
        <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-1.5">
          <HandCoins className="w-4.5 h-4.5 text-green-500" />
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

          <div className="grid grid-cols-2 gap-2">
            {/* Amount */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Amount (₹)</label>
              <input 
                type="number"
                placeholder="₹ 0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-180 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-green-500/20 bg-gray-50/70 font-semibold text-gray-800"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-180 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-green-500/20 bg-gray-50/70 font-medium text-gray-650"
                required
              />
            </div>
          </div>

          {/* Purpose details */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Purpose / Details</label>
            <input 
              type="text"
              placeholder="e.g. Help for groceries, transport"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 border border-gray-180 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-green-500/20 bg-gray-50/70 font-medium text-gray-850"
              required
            />
          </div>

          <button 
            id="give_money_submit"
            type="submit"
            className="w-full py-2.5 text-white font-bold text-xs rounded-xl tracking-wide shadow-xs opacity-90 hover:opacity-100 transition active:scale-[0.98]"
            style={{ backgroundColor: customBtnColor }}
          >
            Save Transaction
          </button>
        </form>
      </div>

      {/* Part 2: All Transactions / Given Money (Step #13) */}
      <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/60">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-900 text-xs tracking-wider uppercase text-gray-400">
            13. All Transactions / Given Money
          </h3>
          <span className="text-[9px] font-bold text-slate-500 bg-white border px-2 py-0.5 rounded-full select-none">
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
                className="flex items-center justify-between p-2.5 bg-white border border-gray-100/80 rounded-xl hover:border-gray-200 transition"
              >
                <div>
                  <h4 className="font-bold text-gray-900 text-[11px] flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.type === 'budget' ? 'bg-indigo-500' : 'bg-green-500'}`} />
                    {item.title}
                  </h4>
                  <p className="text-[9px] text-gray-400 mt-0.5 italic">
                    {item.subtitle}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-gray-900 block">
                    ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                  </span>
                  <span className="text-[9px] text-gray-400 block mt-0.5">
                    {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="text-center mt-3">
          <button 
            type="button"
            onClick={() => alert('Viewing complete consolidated account: showing both family expense limits and member direct allowance logs.')}
            className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-800 transition font-bold bg-white border border-gray-200 rounded-xl"
          >
            View All
          </button>
        </div>
      </div>
    </motion.div>
  );
};
