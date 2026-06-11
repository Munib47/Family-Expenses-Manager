import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { ArrowLeft, BellRing, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppNotification } from '../types';

export const NotificationsScreen: React.FC = () => {
  const { goBack, notifications, customization } = useAppState();
  const [selectedNotif, setSelectedNotif] = useState<AppNotification | null>(null);
  const [clearedIds, setClearedIds] = useState<string[]>([]);

  const textCustomColor = customization.textColor;

  const visibleNotifications = notifications.filter(n => !clearedIds.includes(n.id));

  const handleClearNotif = () => {
    if (selectedNotif) {
      setClearedIds(prev => [...prev, selectedNotif.id]);
      setSelectedNotif(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col p-6 bg-white rounded-2xl relative"
    >
      {/* Header */}
      <div className="flex items-center mt-2 mb-6 justify-between border-b border-gray-100 pb-4">
        <button 
          onClick={goBack} 
          className="py-2.5 px-5 rounded-xl bg-slate-900 text-white font-semibold text-xs tracking-wide hover:bg-slate-850 active:scale-95 transition flex items-center shadow-md"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          Go Back
        </button>
        <span className="text-xs font-bold text-emerald-950 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center">
          <BellRing className="w-3 h-3 mr-1.5" />
          Notifications
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-10 space-y-3">
        {visibleNotifications.length === 0 ? (
          <div className="text-center mt-20 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <BellRing className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-sm font-bold text-gray-500">No Notifications</h3>
            <p className="text-xs text-gray-400 mt-1">Updates and events will appear here.</p>
          </div>
        ) : (
          visibleNotifications.map(notif => (
            <div 
              key={notif.id}
              onClick={() => setSelectedNotif(notif)}
              className="p-4 bg-transparent hover:bg-gray-50 border border-gray-100 rounded-2xl shadow-xs flex justify-between items-center cursor-pointer transition select-none active:scale-[0.99]"
            >
              <div className="flex items-start gap-3 flex-1 overflow-hidden">
                <div className="p-2 bg-red-50 rounded-lg flex-shrink-0 mt-0.5">
                  <BellRing className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="text-sm font-bold text-black truncate">
                    {notif.title}
                  </h4>
                  <p className="text-xs text-teal-600 mt-1 truncate">
                    {notif.message}
                  </p>
                  <span className="text-[10px] font-medium text-gray-400 mt-2 block">
                    {new Date(notif.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedNotif && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center p-6"
            onClick={() => setSelectedNotif(null)}
          >
            <motion.div
              initial={{ y: 20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white border border-gray-200 shadow-xl rounded-2xl w-full max-w-sm p-6 relative"
            >
              <button 
                onClick={() => setSelectedNotif(null)}
                className="absolute top-4 right-4 p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-4">
                <div className="p-3 bg-red-50 rounded-xl">
                  <BellRing className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-bold text-black tracking-tight">
                  {selectedNotif.title}
                </h3>
              </div>

              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Details</h4>
                  <p className="leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 text-teal-600">
                    {selectedNotif.message}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Timestamp</h4>
                  <p className="font-medium text-gray-700">
                    {new Date(selectedNotif.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleClearNotif}
                  className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                >
                  Clear Notification
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
