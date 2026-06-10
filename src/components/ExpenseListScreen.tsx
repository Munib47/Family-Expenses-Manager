import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2,
  TrendingUp, 
  Bell, 
  DollarSign, 
  User, 
  ChevronRight, 
  Wallet,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ExpenseListScreen: React.FC = () => {
  const { 
    expenses, 
    currentUser, 
    activeMonth, 
    budgets, 
    notifications, 
    clearNotifications,
    goBack, 
    navigate, 
    customization,
    firebaseMode,
    deleteExpense,
    formatCurrency
  } = useAppState();

  const [notifExpanded, setNotifExpanded] = useState(false);

  // Filter expenses based on active month (YYYY-MM)
  const monthExpenses = expenses.filter(e => e.month === activeMonth);

  // Roles & View Filter: "Each user sees only their own expenses. Owner sees all users' expenses and totals."
  const isOwner = currentUser?.role === 'owner';
  const hasTotalSpendingAccess = isOwner || currentUser?.permissions?.seeTotalSpending;

  const displayExpenses = isOwner 
    ? monthExpenses 
    : monthExpenses.filter(e => e.userId === currentUser?.uid);

  // Calculations
  const totalAmount = displayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCount = displayExpenses.length;

  // Monthly Budget pacing
  const currentBudgetObj = budgets.find(b => b.month === activeMonth);
  const currentBudget = currentBudgetObj ? currentBudgetObj.amount : 0;
  const percentSpent = currentBudget > 0 ? Math.min((totalAmount / currentBudget) * 100, 100) : 0;

  // Human readable month name
  const monthDisplayNames: Record<string, string> = {
    '2026-04': 'April 2026',
    '2026-05': 'May 2026',
    '2026-06': 'June 2026',
    '2026-07': 'July 2026',
    '2026-08': 'August 2026',
  };
  const readableMonth = monthDisplayNames[activeMonth] || activeMonth;

  // Notification for Owner only (Step #8)
  const ownerNotifications = notifications.filter(n => n.title.includes('Updated') || n.title.includes('Expense'));

  const accentColor = isOwner ? customization.primaryColor : '#22c55e';
  const deleteBtnColor = isOwner ? customization.delBtnColor : '#ef4444';
  const customBtnColor = isOwner ? customization.btnColor : '#000000';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col p-5 bg-white relative"
    >
      {/* Navigation Header */}
      <div className="flex items-center justify-between mt-2 mb-5">
        <button 
          onClick={goBack} 
          className="py-2.5 px-5 rounded-xl bg-slate-900 text-white font-semibold text-xs tracking-wide hover:bg-slate-850 active:scale-95 transition flex items-center shadow-lg hover:shadow-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          Go Back
        </button>
        <span className="text-xs font-bold text-gray-950 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
          📅 {readableMonth}
        </span>
        {/* Quick notification bell for Owner (Step 8 Indicator) */}
        {isOwner && (
          <div className="relative">
            <button 
              onClick={() => setNotifExpanded(!notifExpanded)}
              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 transition flex items-center justify-center border border-amber-100"
            >
              <Bell className="w-4 h-4" />
              {ownerNotifications.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-bold rounded-full w-4.5 h-4.5 text-[9px] flex items-center justify-center animate-bounce">
                  {ownerNotifications.length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* STEP 8: VIEW OWNER NOTIFICATIONS IN-APP PANEL */}
      {isOwner && notifExpanded && ownerNotifications.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 border border-amber-100 bg-gradient-to-br from-amber-50/70 to-orange-50/40 rounded-2xl relative shadow-sm"
        >
          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            🔔 Owner Notification (In-App)
          </div>
          <div className="divide-y divide-amber-100 max-h-[220px] overflow-y-auto">
            {ownerNotifications.map((notif) => (
              <div key={notif.id} className="py-2.5 text-xs first:pt-0 last:pb-0">
                <span className="font-semibold text-amber-800 uppercase text-[9px] bg-amber-100/60 px-1.5 py-0.5 rounded tracking-wider">
                  Expense Updated
                </span>
                <p className="text-gray-700 mt-1.5 leading-relaxed font-medium">
                  {notif.message}
                </p>
                <span className="block text-[10px] text-gray-400 mt-1">
                  {new Date(notif.timestamp).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true
                  })}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button 
              onClick={() => alert('The latest update logs reflect detailed category edits directly in the records list below.')}
              className="flex-1 py-1 px-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-[11px] rounded-xl transition"
            >
              View Details
            </button>
            <button 
              onClick={clearNotifications}
              className="py-1 px-3 bg-amber-200/50 hover:bg-amber-200 text-amber-800 font-semibold text-[11px] rounded-xl transition"
            >
              Clear
            </button>
          </div>
        </motion.div>
      )}

      {/* Header totals card */}
      {hasTotalSpendingAccess ? (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-6 -mt-6" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
            {isOwner ? 'Group Expenditure' : 'Your Managed Budget'}
          </span>
          <div className="flex justify-between items-end mt-2">
            <div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {formatCurrency(totalAmount)}
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Total Expenses • <strong>{totalCount} Items</strong>
              </span>
            </div>
            
            {/* Quick set budget action for owner/allowed user */}
            {(isOwner || currentUser?.permissions?.addBudget) && (
              <button 
                id="budget_setup_link"
                onClick={() => navigate('budget-set')}
                className="text-xs font-semibold hover:underline flex items-center gap-1"
                style={{ color: accentColor }}
              >
                <Wallet className="w-3.5 h-3.5" />
                Set Budget
              </button>
            )}
          </div>

          {/* Budget Progress bar */}
          {currentBudget > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
                <span>Budget Spent: {percentSpent.toFixed(0)}%</span>
                <span>Limit: {formatCurrency(currentBudget)}</span>
              </div>
              <div className="w-full h-2 bg-slate-200/60 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${percentSpent}%`,
                    backgroundColor: percentSpent > 90 ? deleteBtnColor : accentColor 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        // For standard non-privileged user who can't see total spending
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
            Your Personal Ledger
          </span>
          <div className="mt-1.5">
            <span className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalAmount)}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Own Expenses • <strong>{totalCount} Items</strong>
            </span>
          </div>
        </div>
      )}

      {/* Action buttons (Add Expense) */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-900 text-sm tracking-wide">Expense List</h3>
        <button 
          id="add_expense_btn"
          onClick={() => navigate('add-expense')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-white font-semibold text-xs rounded-xl transition shadow-xs active:scale-[0.97]"
          style={{ backgroundColor: customBtnColor }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Expense
        </button>
      </div>

      {/* Expenses items array list (Step #5 & #6 edit icons) */}
      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[460px] pr-1">
        {displayExpenses.length === 0 ? (
          <div className="border border-dashed border-gray-100 rounded-2xl py-12 text-center">
            <p className="text-gray-400 text-xs">No expenses logged for {readableMonth} yet.</p>
            <button 
              onClick={() => navigate('add-expense')}
              className="mt-2 text-xs font-semibold underline"
              style={{ color: accentColor }}
            >
              Add First Record
            </button>
          </div>
        ) : (
          displayExpenses.map((exp) => (
            <div 
              key={exp.id} 
              className="flex items-center justify-between p-3 bg-white border border-gray-100 hover:border-gray-200 rounded-2xl shadow-xs transition"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-xs border"
                  style={{ 
                    borderColor: `${accentColor}1A`, 
                    backgroundColor: `${accentColor}08`, 
                    color: accentColor 
                  }}
                >
                  <span className="font-bold text-sm">
                    {new Date(exp.date).getDate()}
                  </span>
                  <span className="text-[8px] uppercase font-bold text-gray-400">
                    {new Date(exp.date).toLocaleString('default', { month: 'short' })}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-[13px]">{exp.title}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <User className="w-2.5 h-2.5" />
                    By {exp.userName || exp.userEmail.split('@')[0]}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900 block">
                    {formatCurrency(exp.amount, exp.userId)}
                  </span>
                  {exp.details && (
                    <span className="text-[9px] text-gray-400 block max-w-[80px] truncate">
                      {exp.details}
                    </span>
                  )}
                </div>

                {/* Edit Icon Button */}
                <button 
                  onClick={() => navigate('add-expense', { editId: exp.id })}
                  className="p-1 px-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition flex items-center justify-center"
                  title="Edit record"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                {/* Delete Icon Button */}
                <button 
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete this expense of ${formatCurrency(exp.amount, exp.userId)}?`)) {
                      deleteExpense(exp.id);
                    }
                  }}
                  className="p-1 px-1.5 rounded-lg border border-red-50 hover:bg-red-50 text-red-500 transition flex items-center justify-center"
                  style={{ color: deleteBtnColor }}
                  title="Delete record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Visual Role helper */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-medium">
        <span>Logged in: <strong className="text-gray-600">{currentUser?.email}</strong></span>
        <span>Role: <strong className="text-gray-600 capitalize">{currentUser?.role}</strong></span>
      </div>
    </motion.div>
  );
};
