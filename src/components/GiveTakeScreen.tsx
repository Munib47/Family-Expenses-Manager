import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import {
  ArrowLeft, Plus, ChevronDown, ChevronUp,
  ArrowUpRight, ArrowDownLeft, Wallet, User, Calendar, FileText, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GradientSpinner: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center py-10 gap-3">
    <div className="relative w-10 h-10">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, #2dd4bf, #6366f1, #ec4899, #f59e0b, #2dd4bf)',
          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          animation: 'spin 0.9s linear infinite',
        }}
      />
    </div>
    <span className="text-[11px] font-semibold text-gray-400">{label}</span>
  </div>
);

export const GiveTakeScreen: React.FC = () => {
  const {
    giveTakeRecords, deleteGiveTakeRecord,
    goBack, navigate, dataLoading, formatCurrency
  } = useAppState();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'give' | 'take'>('all');

  const toggle = (id: string) => setExpandedId(prev => (prev === id ? null : id));

  const giveRecords = giveTakeRecords.filter(r => r.type === 'give');
  const takeRecords = giveTakeRecords.filter(r => r.type === 'take');

  const totalGive = giveRecords.reduce((s, r) => s + r.amount, 0);
  const totalTake = takeRecords.reduce((s, r) => s + r.amount, 0);
  const balance = totalGive - totalTake;
  const balancePositive = balance >= 0;

  const filtered =
    activeTab === 'give' ? [...giveRecords].sort((a, b) => b.date !== a.date ? b.date.localeCompare(a.date) : (b.createdAt ?? 0) - (a.createdAt ?? 0)) :
    activeTab === 'take' ? [...takeRecords].sort((a, b) => b.date !== a.date ? b.date.localeCompare(a.date) : (b.createdAt ?? 0) - (a.createdAt ?? 0)) :
    [...giveTakeRecords].sort((a, b) => b.date !== a.date ? b.date.localeCompare(a.date) : (b.createdAt ?? 0) - (a.createdAt ?? 0));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col p-5 bg-white relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between mt-2 mb-5">
        <button
          onClick={goBack}
          className="py-2.5 px-5 rounded-xl bg-slate-900 text-white font-semibold text-xs tracking-wide active:scale-95 transition flex items-center shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 stroke-[2.5]" />Go Back
        </button>
        <span className="text-xs font-extrabold text-slate-700 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200">
          💸 Give / Take
        </span>
      </div>

      {/* Summary cards */}
      {dataLoading ? (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl mb-4">
          <GradientSpinner label="Loading records…" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Give */}
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1 text-teal-600">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Give</span>
            </div>
            <span className="text-sm font-extrabold text-teal-700 leading-tight">
              {formatCurrency(totalGive)}
            </span>
            <span className="text-[9px] text-teal-500 font-semibold">{giveRecords.length} records</span>
          </div>

          {/* Take */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1 text-red-500">
              <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Take</span>
            </div>
            <span className="text-sm font-extrabold text-red-600 leading-tight">
              {formatCurrency(totalTake)}
            </span>
            <span className="text-[9px] text-red-400 font-semibold">{takeRecords.length} records</span>
          </div>

          {/* Balance */}
          <div className={`rounded-2xl p-3 flex flex-col gap-1 border ${balancePositive ? 'bg-teal-50 border-teal-100' : 'bg-red-50 border-red-100'}`}>
            <div className={`flex items-center gap-1 ${balancePositive ? 'text-teal-600' : 'text-red-500'}`}>
              <Wallet className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Balance</span>
            </div>
            <span className={`text-sm font-extrabold leading-tight ${balancePositive ? 'text-teal-700' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(balance))}
            </span>
            <span className={`text-[9px] font-semibold ${balancePositive ? 'text-teal-500' : 'text-red-400'}`}>
              {balancePositive ? '✓ Net positive' : '⚠ Net owed'}
            </span>
          </div>
        </div>
      )}

      {/* Tabs + Add buttons */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
          {(['all', 'give', 'take'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize transition ${
                activeTab === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'all' ? 'All' : tab === 'give' ? '↑ Give' : '↓ Take'}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => navigate('add-give-take', { type: 'give' })}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-[10px] rounded-xl transition shadow-sm active:scale-[0.97]"
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />Give
          </button>
          <button
            onClick={() => navigate('add-give-take', { type: 'take' })}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] rounded-xl transition shadow-sm active:scale-[0.97]"
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />Take
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[420px] pr-0.5">
        {dataLoading ? (
          <GradientSpinner label="Loading records…" />
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-gray-100 rounded-2xl py-12 text-center">
            <p className="text-gray-400 text-xs">No {activeTab === 'all' ? '' : activeTab} records yet.</p>
            <div className="flex justify-center gap-3 mt-3">
              <button onClick={() => navigate('add-give-take', { type: 'give' })}
                className="text-[10px] font-bold text-teal-600 underline underline-offset-2">+ Add Give</button>
              <button onClick={() => navigate('add-give-take', { type: 'take' })}
                className="text-[10px] font-bold text-red-500 underline underline-offset-2">+ Add Take</button>
            </div>
          </div>
        ) : (
          filtered.map(record => {
            const isGive = record.type === 'give';
            const isExpanded = expandedId === record.id;

            return (
              <div
                key={record.id}
                className={`flex flex-col rounded-2xl border transition cursor-pointer ${
                  isGive ? 'bg-teal-50/40 border-teal-100 hover:border-teal-200' : 'bg-red-50/40 border-red-100 hover:border-red-200'
                }`}
                onClick={() => toggle(record.id)}
              >
                {/* Row */}
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                      isGive ? 'bg-teal-100/60 border-teal-200 text-teal-600' : 'bg-red-100/60 border-red-200 text-red-500'
                    }`}>
                      {isGive
                        ? <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                        : <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-[13px]">{record.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {isGive ? 'Given to' : 'Taken from'}{' '}
                        <span className="font-semibold text-gray-700">{record.personName}</span>
                        {' · '}
                        {new Date(record.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <span className={`text-sm font-extrabold ${isGive ? 'text-teal-700' : 'text-red-600'}`}>
                      {formatCurrency(record.amount)}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); navigate('add-give-take', { editId: record.id, type: record.type }); }}
                      className="p-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition"
                    >
                      <FileText className="w-3 h-3" />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm(`Delete "${record.title}"?`)) deleteGiveTakeRecord(record.id);
                      }}
                      className={`p-1 rounded-lg border transition ${
                        isGive ? 'border-teal-100 hover:bg-teal-50 text-teal-400 hover:text-teal-600' : 'border-red-100 hover:bg-red-50 text-red-400 hover:text-red-600'
                      }`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <span className="text-gray-300">
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className={`mx-3 mb-3 p-3 rounded-xl border text-xs space-y-2 ${
                        isGive ? 'bg-teal-50/70 border-teal-100' : 'bg-red-50/70 border-red-100'
                      }`}>
                        <div className="flex justify-between">
                          <span className="text-gray-400 flex items-center gap-1"><FileText className="w-3 h-3" />Title</span>
                          <span className="font-semibold text-gray-900">{record.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 flex items-center gap-1">
                            <User className="w-3 h-3" />{isGive ? 'Given To' : 'Taken From'}
                          </span>
                          <span className="font-semibold text-gray-900">{record.personName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 flex items-center gap-1"><Wallet className="w-3 h-3" />Amount</span>
                          <span className={`font-extrabold ${isGive ? 'text-teal-700' : 'text-red-600'}`}>
                            {formatCurrency(record.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />Date</span>
                          <span className="font-semibold text-gray-900">
                            {new Date(record.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        {record.details && (
                          <div className="pt-1.5 border-t border-gray-100">
                            <span className="text-gray-400 block mb-1">Details</span>
                            <p className={`leading-relaxed font-medium ${isGive ? 'text-teal-700' : 'text-red-600'}`}>
                              {record.details}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Footer legend */}
      <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-400 text-center font-medium">
        <span className="text-teal-500 font-bold">Give</span> = money you loaned out &nbsp;·&nbsp;
        <span className="text-red-500 font-bold">Take</span> = money you borrowed
      </div>
    </motion.div>
  );
};