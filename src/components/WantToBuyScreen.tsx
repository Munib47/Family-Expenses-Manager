import React from 'react';
import { useAppState } from '../context/StateContext';
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckSquare, 
  Square, 
  ShoppingBag,
  User,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export const WantToBuyScreen: React.FC = () => {
  const { 
    wantToBuyItems, 
    toggleWantToBuyItem, 
    deleteWantToBuyItem, 
    activeMonth, 
    goBack, 
    navigate, 
    customization,
    currentUser
  } = useAppState();

  // Filter items by active month
  const displayItems = wantToBuyItems.filter(item => item.month === activeMonth);

  const completedCount = displayItems.filter(i => i.checked).length;
  const pendingCount = displayItems.length - completedCount;

  // Custom colors based on owner options
  const isOwner = currentUser?.role === 'owner';
  const customChkColor = isOwner ? customization.chkColor : '#22c55e';
  const customDelColor = isOwner ? customization.delBtnColor : '#ef4444';
  const customBtnColor = isOwner ? customization.btnColor : '#000000';

  const monthDisplayNames: Record<string, string> = {
    '2026-04': 'April 2026',
    '2026-05': 'May 2026',
    '2026-06': 'June 2026',
    '2026-07': 'July 2026',
    '2026-08': 'August 2026',
  };
  const readableMonth = monthDisplayNames[activeMonth] || activeMonth;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col p-5 bg-white"
    >
      {/* Navigation Title Bar */}
      <div className="flex items-center justify-between mt-2 mb-5">
        <button 
          onClick={goBack} 
          className="py-2.5 px-5 rounded-xl bg-slate-900 text-white font-semibold text-xs tracking-wide hover:bg-slate-850 active:scale-95 transition flex items-center shadow-lg hover:shadow-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          Go Back
        </button>
        <span className="text-xs font-bold text-gray-950 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200">
          🛒 {readableMonth} list
        </span>
      </div>

      {/* Summary Box */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Shopping List</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {pendingCount} Pending • {completedCount} Done
            </p>
          </div>
        </div>

        {/* Small Progress Donut / Indicator */}
        <div className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
          {displayItems.length > 0 
            ? `${((completedCount / displayItems.length) * 100).toFixed(0)}% Done` 
            : 'Empty'}
        </div>
      </div>

      {/* Want to Buy Items List and Add Button */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-900 text-sm tracking-wide">Want to Buy</h3>
        <button 
          id="add_item_btn"
          onClick={() => navigate('add-buy-item')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-white font-semibold text-xs rounded-xl transition shadow-xs active:scale-[0.97]"
          style={{ backgroundColor: customBtnColor }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </button>
      </div>

      {/* Items Rows */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[460px]">
        {displayItems.length === 0 ? (
          <div className="border border-dashed border-gray-100 rounded-2xl py-12 text-center">
            <p className="text-gray-400 text-xs">No items in the wishlist for {readableMonth}.</p>
            <button 
              onClick={() => navigate('add-buy-item')}
              className="mt-2 text-xs font-semibold underline text-blue-600 hover:text-blue-800"
            >
              Add First Wishlist Item
            </button>
          </div>
        ) : (
          displayItems.map((item) => (
            <div 
              key={item.id}
              className={`flex items-center justify-between p-3 border rounded-2xl transition-all ${
                item.checked 
                  ? 'bg-gray-50/50 border-gray-100 opacity-70' 
                  : 'bg-white border-gray-100 shadow-xs'
              }`}
            >
              {/* Checkbox and description */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleWantToBuyItem(item.id)}
                  className="flex-shrink-0 transition-transform active:scale-95"
                  style={{ color: item.checked ? customChkColor : '#cbd5e1' }}
                  title={item.checked ? 'Mark pending' : 'Mark done'}
                >
                  {item.checked ? (
                    <CheckSquare className="w-5 h-5" style={{ color: customChkColor }} />
                  ) : (
                    <Square className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                  )}
                </button>
                
                <div>
                  <h4 className={`font-bold text-[13px] ${item.checked ? 'line-through text-gray-400 font-medium' : 'text-gray-900'}`}>
                    {item.name}
                  </h4>
                  <span className="text-[10px] text-gray-400 block mt-0.5 flex items-center gap-1">
                    <User className="w-2.5 h-2.5" />
                    By {item.userName || 'Member'}
                  </span>
                </div>
              </div>

              {/* Quantity indicator & controls */}
              <div className="flex items-center gap-3">
                <span className="font-bold text-xs bg-gray-100/80 px-2.5 py-1 rounded-lg text-gray-700 min-w-[32px] text-center border border-gray-200/50">
                  {item.quantity}
                </span>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-1.5 border-l border-gray-100 pl-3">
                  <button 
                    onClick={() => navigate('add-buy-item', { editId: item.id })}
                    className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition flex items-center justify-center font-medium"
                    title="Edit quantity/name"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button 
                    onClick={() => deleteWantToBuyItem(item.id)}
                    className="p-1.5 rounded-lg border border-red-50 hover:bg-red-50 text-red-500 transition flex items-center justify-center font-medium"
                    style={{ color: customDelColor }}
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rules Notice */}
      <div className="mt-4 p-3 rounded-xl bg-green-50/50 border border-green-100 text-[10px] text-green-800 leading-relaxed font-semibold">
        💡 All users (including owner) share this list. Checked items act as shopping completed tasks.
      </div>
    </motion.div>
  );
};
