import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { ArrowLeft, Save, Coins, Layers, User, Settings2, Palette } from 'lucide-react';
import { motion } from 'motion/react';

export const CustomizationScreen: React.FC = () => {
  const { customization, updateCustomization, goBack, currentUser, users } = useAppState();

  const [bgColor, setBgColor] = useState(customization.bgColor || '#ffffff');
  const [textColor, setTextColor] = useState(customization.textColor || '#000000');
  const [primaryColor, setPrimaryColor] = useState(customization.primaryColor || '#22c55e');
  const [btnColor, setBtnColor] = useState(customization.btnColor || '#0052CC');
  const [chkColor, setChkColor] = useState(customization.chkColor || '#22c55e');
  const [delBtnColor, setDelBtnColor] = useState(customization.delBtnColor || '#ef4444');

  // Currency states
  const [currency, setCurrency] = useState(customization.currency || 'PKR');
  const [currencyScope, setCurrencyScope] = useState<'global' | 'specific'>(customization.currencyScope || 'global');
  const [userCurrencies, setUserCurrencies] = useState<Record<string, string>>(customization.userCurrencies || {});

  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    
    await updateCustomization({
      bgColor,
      textColor,
      primaryColor,
      btnColor,
      chkColor,
      delBtnColor,
      currency,
      currencyScope,
      userCurrencies
    });

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      goBack();
    }, 1200);
  };

  const currencyOptions = ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'INR'];

  const bgOptions = ['#ffffff', '#f8fafc', '#fffbeb', '#f0fdf4', '#fafafa', '#0f172a'];
  const textOptions = ['#000000', '#1e293b', '#0369a1', '#166534', '#475569'];
  const primaryOptions = ['#22c55e', '#0ea5e9', '#6366f1', '#e11d48', '#8b5cf6'];
  const btnOptions = ['#000005', '#1e1b4b', '#0f172a', '#1e3a8a', '#15803d'];
  const chkOptions = ['#22c55e', '#06b6d4', '#eab308', '#ec4899', '#3b82f6'];
  const delOptions = ['#ef4444', '#dc2626', '#b91c1c', '#000000', '#d97706'];

  const isOwner = currentUser?.role === 'owner';

  const handleUserCurrencyChange = (uid: string, currencySymbol: string) => {
    setUserCurrencies(prev => ({
      ...prev,
      [uid]: currencySymbol
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col justify-between p-6 bg-white overflow-y-auto rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mt-2 mb-6 border-b border-gray-100 pb-4">
        <button 
          onClick={goBack} 
          className="py-2 px-5 rounded-xl bg-slate-900 text-white font-semibold text-xs tracking-wide hover:bg-slate-850 active:scale-95 transition flex items-center shadow-md"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          Go Back
        </button>
        <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
          <Settings2 className="w-4 h-4 text-emerald-500" />
          Settings & Customization
        </h3>
        <button 
          onClick={handleSave}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition flex items-center gap-1 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-100"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>
      </div>

      {saved && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-extrabold text-center border border-emerald-150 animate-bounce">
          ✓ Currency settings & colors applied successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="flex-1 space-y-6 max-w-[440px] mx-auto w-full pb-6">
        {/* SECTION 1: CURRENCY SETTINGS (Default PKR, Owner Only) */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4.5 space-y-4">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-emerald-500" />
            Currency Control Panel
          </h4>

          {/* Primary default currency select */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">
              Default System Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 cursor-pointer"
            >
              {currencyOptions.map((curr) => (
                <option key={curr} value={curr}>
                  {curr} (Family Standard)
                </option>
              ))}
            </select>
          </div>

          {/* Toggle choice: Whole app (global) or Specific user */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">
              Currency Calculation Scope
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-200/50 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setCurrencyScope('global')}
                className={`py-2 text-xs font-extrabold rounded-lg transition-all ${
                  currencyScope === 'global'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Global (Whole App)
              </button>
              <button
                type="button"
                onClick={() => setCurrencyScope('specific')}
                className={`py-2 text-xs font-extrabold rounded-lg transition-all ${
                  currencyScope === 'specific'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Specific (User-by-User)
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 font-medium">
              {currencyScope === 'global'
                ? 'All household active balances will be formatted in PKR (or chosen system currency).'
                : 'Define independent localized currencies for individual family participants.'}
            </p>
          </div>

          {/* If Specific User list selected, let owner select symbol per user */}
          {currencyScope === 'specific' && (
            <div className="border-t border-slate-200 pt-3.5 space-y-3 animate-fade-in">
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Assign Member Currencies
              </span>
              {users.length === 0 ? (
                <p className="text-[10px] text-gray-400 italic">No family members registered yet.</p>
              ) : (
                <div className="space-y-2">
                  {users.map((member) => (
                    <div key={member.uid} className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-2.5">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">{member.fullName}</span>
                      </div>
                      <select
                        value={userCurrencies[member.uid] || currency}
                        onChange={(e) => handleUserCurrencyChange(member.uid, e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
                      >
                        {currencyOptions.map((curr) => (
                          <option key={curr} value={curr}>{curr}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: THEME ACENTS & VISUAL ACCENTS */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4.5 space-y-4">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Palette className="w-4 h-4 text-emerald-500" />
            Theme Color Settings
          </h4>

          {/* Background Color circles */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              Dashboard Background
              <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-xs" style={{ backgroundColor: bgColor }} />
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {bgOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBgColor(color)}
                  className={`w-7 h-7 rounded-full border transition-all active:scale-90 flex items-center justify-center cursor-pointer ${
                    bgColor === color ? 'ring-2 ring-emerald-500 ring-offset-2 border-transparent scale-105' : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Text Color circles */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              Text Typography
              <span className="text-[10px] lowercase font-semibold" style={{ color: textColor }}>(Abc)</span>
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {textOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setTextColor(color)}
                  className={`w-7 h-7 rounded-full border transition-all active:scale-90 flex items-center justify-center cursor-pointer ${
                    textColor === color ? 'ring-2 ring-emerald-500 ring-offset-2 border-transparent scale-105' : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Primary Accent Color circles */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Highlights & Pacing Progress Bar
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {primaryOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setPrimaryColor(color)}
                  className={`w-7 h-7 rounded-full border transition-all active:scale-90 cursor-pointer ${
                    primaryColor === color ? 'ring-2 ring-emerald-500 ring-offset-2 scale-105' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Button Background circles */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Action Button Accents
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {btnOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBtnColor(color)}
                  className={`w-7 h-7 rounded-full border transition-all active:scale-90 cursor-pointer ${
                    btnColor === color ? 'ring-2 ring-emerald-500 ring-offset-2 scale-105' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Checkbox Icon circles */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Wishlist Checkbox Check State
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {chkOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setChkColor(color)}
                  className={`w-7 h-7 rounded-full border transition-all active:scale-90 cursor-pointer ${
                    chkColor === color ? 'ring-2 ring-emerald-500 ring-offset-2 scale-105' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Delete button Color circles */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Danger Button / Delete Accent
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {delOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setDelBtnColor(color)}
                  className={`w-7 h-7 rounded-full border transition-all active:scale-90 cursor-pointer ${
                    delBtnColor === color ? 'ring-2 ring-emerald-500 ring-offset-2 scale-105' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        <button 
          id="customization_save_btn"
          type="submit"
          className="w-full py-3.5 text-white font-extrabold text-sm rounded-xl tracking-wide shadow-lg hover:shadow-xl transition-all active:scale-[0.98] mt-4 cursor-pointer"
          style={{ backgroundColor: btnColor }}
        >
          Save Layout & Currencies
        </button>
      </form>

      {/* Changes apply only to owner's view */}
      <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500 font-bold text-center leading-relaxed">
        💡 Changes apply dynamically to participants. Customize colors to elevate your personal frosted glass layout styles.
      </div>
    </motion.div>
  );
};
