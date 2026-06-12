import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { ArrowLeft, Save, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const AddEditGiveTakeScreen: React.FC = () => {
  const {
    addGiveTakeRecord, editGiveTakeRecord,
    giveTakeRecords, goBack,
    currentScreenParams, getCurrencySymbol,
  } = useAppState();

  const paramType: 'give' | 'take' = currentScreenParams?.type || 'give';
  const editId: string | undefined = currentScreenParams?.editId;
  const isEditing = !!editId;
  const existing = isEditing ? giveTakeRecords.find(r => r.id === editId) : null;

  const [type, setType] = useState<'give' | 'take'>(existing?.type || paramType);
  const [title, setTitle] = useState(existing?.title || '');
  const [personName, setPersonName] = useState(existing?.personName || '');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [date, setDate] = useState(() => {
    if (existing?.date) return existing.date;
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  });
  const [details, setDetails] = useState(existing?.details || '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isGive = type === 'give';
  const accentBg    = isGive ? 'bg-teal-500 hover:bg-teal-600'  : 'bg-red-500 hover:bg-red-600';
  const accentBorder = isGive
    ? 'border-gray-200 focus:border-teal-500 focus:ring-teal-500/20'
    : 'border-gray-200 focus:border-red-500 focus:ring-red-500/20';
  const accentText  = isGive ? 'text-teal-600' : 'text-red-600';
  const typeLabel   = isGive ? 'Give' : 'Take';
  const personLabel = isGive ? 'Given To (Name)' : 'Taken From (Name)';
  const personPlaceholder = isGive ? 'e.g. Ahmad, Sara' : 'e.g. Ali, Usman';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!personName.trim()) { setError(`"${personLabel}" is required.`); return; }
    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) { setError('Enter a valid positive amount.'); return; }
    if (!date) { setError('Date is required.'); return; }

    setSaving(true);
    try {
      if (isEditing && editId) {
        await editGiveTakeRecord(editId, { title, personName, amount: amtNum, date, details, type });
      } else {
        await addGiveTakeRecord({ title, personName, amount: amtNum, date, details, type });
      }
      goBack();
    } catch (err: any) {
      setError(err.message || 'Failed to save record.');
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col p-5 bg-white overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mt-2 mb-6">
        <button onClick={goBack}
          className="py-2.5 px-5 rounded-xl bg-slate-900 text-white font-semibold text-xs tracking-wide active:scale-95 transition flex items-center shadow-lg">
          <ArrowLeft className="w-4 h-4 mr-1.5 stroke-[2.5]" />Go Back
        </button>
        <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 ${
          isGive ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {isGive
            ? <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            : <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />}
          {isEditing ? `Edit ${typeLabel}` : `Add ${typeLabel}`}
        </span>
      </div>

      {/* Type toggle — only for new records */}
      {!isEditing && (
        <div className="flex bg-slate-100 rounded-2xl p-1 mb-5">
          <button type="button" onClick={() => setType('give')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
              type === 'give' ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />Give (Loan Out)
          </button>
          <button type="button" onClick={() => setType('take')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
              type === 'take' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />Take (Borrowed)
          </button>
        </div>
      )}

      {/* Context hint */}
      <div className={`p-3 rounded-xl border mb-5 text-xs font-medium ${
        isGive ? 'bg-teal-50/60 border-teal-100 text-teal-700' : 'bg-red-50/60 border-red-100 text-red-600'
      }`}>
        {isGive
          ? '↑ You are recording money you GAVE (loaned) to someone.'
          : '↓ You are recording money you TOOK (borrowed) from someone.'}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-4 flex-1">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Title</label>
          <input type="text"
            placeholder={isGive ? 'e.g. Lent for groceries' : 'e.g. Borrowed for rent'}
            value={title} onChange={e => setTitle(e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50/50 font-semibold text-gray-800 transition ${accentBorder}`}
            required />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{personLabel}</label>
          <input type="text" placeholder={personPlaceholder}
            value={personName} onChange={e => setPersonName(e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50/50 font-semibold text-gray-800 transition ${accentBorder}`}
            required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Amount</label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm ${accentText}`}>
                {getCurrencySymbol()}
              </span>
              <input type="number" placeholder="0.00"
                value={amount} onChange={e => setAmount(e.target.value)}
                className={`w-full pl-10 pr-3 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50/50 font-bold text-gray-900 transition ${accentBorder}`}
                required min="0.01" step="0.01" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className={`w-full px-3 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50/50 font-semibold text-gray-800 transition ${accentBorder}`}
              required />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Details / Notes <span className="text-gray-300 normal-case">(optional)</span>
          </label>
          <textarea placeholder="Any additional notes…"
            value={details} onChange={e => setDetails(e.target.value)}
            rows={3}
            className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50/50 font-medium text-gray-800 transition resize-none ${accentBorder}`} />
        </div>

        <button type="submit" disabled={saving}
          className={`w-full py-3.5 text-white font-extrabold text-sm rounded-xl tracking-wide shadow-md hover:shadow-lg transition active:scale-[0.98] uppercase flex justify-center items-center gap-2 disabled:opacity-60 ${accentBg}`}>
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : isEditing ? `Update ${typeLabel} Record` : `Save ${typeLabel} Record`}
        </button>
      </form>
    </motion.div>
  );
};