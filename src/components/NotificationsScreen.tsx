import React, { useEffect, useState } from 'react';
import { useAppState } from '../context/StateContext';
import { ArrowLeft, BellRing, ChevronRight, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppNotification } from '../types';

const GradientSpinner: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, #2dd4bf, #6366f1, #ec4899, #f59e0b, #2dd4bf)',
          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          animation: 'spin 0.9s linear infinite'
        }}
      />
    </div>
    <span className="text-[11px] font-semibold text-gray-400">{label}</span>
  </div>
);

export const NotificationsScreen: React.FC = () => {
  const { 
    goBack, 
    notifications, 
    currentUser, 
    markNotificationsRead, 
    clearNotifications,
    dataLoading
  } = useAppState();

  const [selectedNotif, setSelectedNotif] = useState<AppNotification | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  // Mark all as read the moment this screen is opened
  useEffect(() => {
    if (!dataLoading && notifications.length > 0) {
      markNotificationsRead();
    }
  }, [dataLoading]);

  const handleClearAll = async () => {
    if (!confirm('Clear all notifications? This cannot be undone.')) return;
    setIsClearing(true);
    await clearNotifications();
    setIsClearing(false);
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
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-950 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center">
            <BellRing className="w-3 h-3 mr-1.5" />
            Notifications
          </span>
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={isClearing}
              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 transition disabled:opacity-50"
              title="Clear all notifications"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-10 space-y-3">
        {dataLoading ? (
          <GradientSpinner label="Loading notifications…" />
        ) : notifications.length === 0 ? (
          <div className="text-center mt-20 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <BellRing className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-sm font-bold text-gray-500">No Notifications</h3>
            <p className="text-xs text-gray-400 mt-1">Updates and events will appear here.</p>
          </div>
        ) : (
          notifications.map(notif => {
            const isRead = (notif.readBy || []).includes(currentUser?.uid || '');
            return (
              <div 
                key={notif.id}
                onClick={() => setSelectedNotif(notif)}
                className={`p-4 border rounded-2xl shadow-xs flex justify-between items-center cursor-pointer transition select-none active:scale-[0.99] ${
                  isRead 
                    ? 'bg-transparent hover:bg-gray-50 border-gray-100' 
                    : 'bg-amber-50/40 hover:bg-amber-50/70 border-amber-100'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 overflow-hidden">
                  <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${isRead ? 'bg-gray-100' : 'bg-red-50'}`}>
                    <BellRing className={`w-4 h-4 ${isRead ? 'text-gray-400' : 'text-red-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold truncate ${isRead ? 'text-gray-500' : 'text-black'}`}>
                        {notif.title}
                      </h4>
                      {!isRead && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500" />
                      )}
                    </div>
                    <p className="text-xs text-teal-600 mt-1 truncate">{notif.message}</p>
                    <span className="text-[10px] font-medium text-gray-400 mt-2 block">
                      {new Date(notif.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </div>
            );
          })
        )}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedNotif && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex items-center justify-center p-6"
            onClick={() => setSelectedNotif(null)}
          >
            <motion.div
              initial={{ y: 20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-black border border-gray-800 shadow-xl rounded-2xl w-full max-w-sm p-6 relative"
            >
              <button 
                onClick={() => setSelectedNotif(null)}
                className="absolute top-4 right-4 p-2 bg-gray-900 rounded-full hover:bg-gray-800 text-gray-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-5 border-b border-gray-800 pb-4">
                <div className="p-3 bg-red-950/40 rounded-xl">
                  <BellRing className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-bold text-white tracking-tight">{selectedNotif.title}</h3>
              </div>
              <div className="space-y-4 text-sm text-gray-400">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Details</h4>
                  <p className="leading-relaxed bg-gray-900 p-3 rounded-lg border border-gray-800 text-teal-400">
                    {selectedNotif.message}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Timestamp</h4>
                  <p className="font-medium text-gray-300">{new Date(selectedNotif.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-bold text-xs rounded-xl transition shadow-sm hover:opacity-90"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};