import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { ArrowLeft, Trash2, Settings2, UserPlus, Mail, ChevronRight, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GradientSpinner: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center py-10 gap-3">
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

export const ManageUsersScreen: React.FC = () => {
  const { users, removeUserAccess, goBack, navigate, customization, currentUser, addNotification, dataLoading } = useAppState();

  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const listUsers = users;

  const handleRemoveAccess = async (userId: string) => {
    if (confirm("Are you sure you want to revoke this user's access?")) {
      const removedUser = users.find(u => u.uid === userId);
      await removeUserAccess(userId);
      await addNotification('Member Revoked', `Access removed for ${removedUser?.fullName || 'User'}`);
      setSelectedUser(null);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newUserName.trim() || !newUserEmail.trim()) {
      setError('Please provide Name and Email');
      return;
    }
    try {
      const userId = `u_whitelisted_${Date.now()}`;
      const newUser = {
        uid: userId, email: newUserEmail, fullName: newUserName,
        role: 'authorized_user' as const,
        permissions: {
          addBudget: false, seeTotalSpending: true, addGiveMoney: false,
          viewAllTransactions: false, manageWantToBuy: true,
          appCustomization: false, manageUsers: false, viewNotifications: false,
        }
      };
      const { SmartDBService } = await import('../lib/firebase');
      await SmartDBService.set(`users/${userId}`, newUser);
      await addNotification('Member Whitelisted', `New family member whitelisted: ${newUserName}`);
      setNewUserName(''); setNewUserEmail(''); setShowAddUserModal(false);
    } catch (err: any) {
      setError(err.message || 'Error whitelisting member');
    }
  };

  const isOwner = currentUser?.role === 'owner';
  const customDelColor = isOwner ? customization.delBtnColor : '#ef4444';

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 flex flex-col p-5 bg-white relative justify-between"
    >
      <div>
        <div className="flex items-center justify-between mt-2 mb-4">
          <button onClick={goBack} className="py-2.5 px-5 rounded-xl bg-slate-900 text-white font-semibold text-xs tracking-wide active:scale-95 transition flex items-center shadow-lg">
            <ArrowLeft className="w-4 h-4 mr-1.5 stroke-[2.5]" />Go Back
          </button>
          <button onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-xl transition">
            <UserPlus className="w-3.5 h-3.5" />Add User
          </button>
        </div>

        {!selectedUser ? (
          <div>
            <div className="mb-4">
              <h3 className="font-bold text-gray-900 text-sm">Manage Users & Access</h3>
              <p className="text-xs text-gray-500 mt-0.5">Control who can access accounts and modules</p>
            </div>
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-0.5">
              {dataLoading ? (
                <GradientSpinner label="Loading users…" />
              ) : listUsers.map((user) => (
                <button key={user.uid} onClick={() => setSelectedUser(user)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 border border-gray-100 rounded-2xl text-left transition shadow-xs active:scale-[0.99] bg-white group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-extrabold border shadow-inner">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs">{user.fullName}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-gray-400" />{user.email}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
            className="p-5 border border-gray-100 rounded-3xl bg-slate-50/50 text-center">
            <button onClick={() => setSelectedUser(null)}
              className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg border border-gray-200 bg-white text-[10px] font-bold text-gray-600 mb-5 text-left float-left transition">
              ← Back to Users List
            </button>
            <div className="clear-both" />
            <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100/50 flex items-center justify-center mx-auto text-indigo-600 font-black text-2xl shadow-inner mb-3">
              {selectedUser.fullName.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-bold text-gray-900 text-base">{selectedUser.fullName}</h3>
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />{selectedUser.email}
            </p>
            <div className="space-y-3 mt-6">
              <button onClick={() => navigate('permissions-set', { userId: selectedUser.uid })}
                className="w-full py-3 bg-white hover:bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 active:scale-[0.98]">
                <Settings2 className="w-4 h-4" />Access & Permissions
              </button>
              {selectedUser.uid !== currentUser?.uid && (
                <button onClick={() => handleRemoveAccess(selectedUser.uid)}
                  className="w-full py-3 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 active:scale-[0.98]"
                  style={{ backgroundColor: customDelColor }}>
                  <Trash2 className="w-4 h-4" />Delete User
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showAddUserModal && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-40">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-5 w-full max-w-[320px] border border-gray-100 shadow-xl">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-900 text-sm">Add Whitelisted Member</h4>
                <button onClick={() => setShowAddUserModal(false)} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {error && (
                <div className="p-2 rounded-xl bg-red-50 text-red-600 text-[10px] font-semibold mb-2.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />{error}
                </div>
              )}
              <form onSubmit={handleAddUser} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Display Name</label>
                  <input type="text" placeholder="e.g. Ali, Sara" value={newUserName} onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-200 focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
                  <input type="email" placeholder="member@example.com" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-200 focus:outline-none" required />
                </div>
                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition mt-2">
                  Whitelist Member
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="text-center text-[10px] text-gray-400 font-semibold mb-2 mt-4">
        🛡️ Whitelisted family members can login and access whitelisted modules.
      </div>
    </motion.div>
  );
};