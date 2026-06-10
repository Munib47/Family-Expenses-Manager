import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/StateContext';
import { ArrowLeft, Save, ShoppingBag, Plus, Minus, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const AddEditBuyItemScreen: React.FC = () => {
  const { 
    addWantToBuyItem, 
    editWantToBuyItem, 
    wantToBuyItems, 
    goBack, 
    currentScreenParams, 
    activeMonth,
    customization,
    currentUser
  } = useAppState();

  const editId = currentScreenParams?.editId;
  const isEdit = !!editId;

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit) {
      const existing = wantToBuyItems.find(i => i.id === editId);
      if (existing) {
        setName(existing.name);
        setQuantity(existing.quantity);
      }
    }
  }, [isEdit, editId, wantToBuyItems]);

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => Math.max(1, prev - 1));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Item Name must be provided.');
      return;
    }

    try {
      if (isEdit) {
        await editWantToBuyItem(editId, { name, quantity });
      } else {
        await addWantToBuyItem({ name, quantity });
      }
      goBack();
    } catch (err: any) {
      setError(err.message || 'Error saving checkout item.');
    }
  };

  const isOwner = currentUser?.role === 'owner';
  const customBtnColor = isOwner ? customization.btnColor : '#000000';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col justify-between p-6 bg-white"
    >
      {/* Header with Cancel and top Save indicator */}
      <div className="flex items-center justify-between mt-2 mb-6">
        <button 
          onClick={goBack} 
          className="py-2.5 px-5 rounded-xl bg-slate-900 text-white font-semibold text-xs tracking-wide hover:bg-slate-850 active:scale-95 transition flex items-center shadow-lg hover:shadow-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          Go Back
        </button>
        <h3 className="font-bold text-gray-950 text-sm">
          {isEdit ? 'Edit Item' : 'Add Item'}
        </h3>
        <button 
          onClick={handleSave}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>
      </div>

      <form onSubmit={handleSave} className="flex-1 space-y-6 max-w-[360px] mx-auto w-full flex flex-col justify-center">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Item Name Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Item Name
          </label>
          <div className="relative">
            <input 
              type="text"
              placeholder="Enter item name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 font-medium"
              required
            />
          </div>
        </div>

        {/* Quantity Increments Option (Step #10 Design Detail) */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Quantity
          </label>
          <div className="flex items-center justify-center gap-4 bg-gray-50 border border-gray-150 p-4 rounded-xl">
            <button 
              type="button"
              onClick={handleDecrement}
              className="w-10 h-10 rounded-full bg-white border border-gray-250 shadow-xs flex items-center justify-center text-gray-700 hover:bg-gray-100 transition font-bold"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xl font-extrabold text-gray-900 min-w-[36px] text-center">
              {quantity}
            </span>
            <button 
              type="button"
              onClick={handleIncrement}
              className="w-10 h-10 rounded-full bg-white border border-gray-250 shadow-xs flex items-center justify-center text-gray-700 hover:bg-gray-100 transition font-bold"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button 
          id="item_save_btn"
          type="submit"
          className="w-full py-3.5 text-white font-semibold text-sm rounded-xl tracking-wide shadow-md transition-all active:scale-[0.98] mt-4"
          style={{ backgroundColor: customBtnColor }}
        >
          Save Item
        </button>
      </form>

      <div className="mt-4 text-center text-[10px] text-gray-400 font-medium">
        Active List Period: <strong className="text-gray-600">{activeMonth}</strong>
      </div>
    </motion.div>
  );
};
