import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/StateContext';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  ToggleLeft, 
  ToggleRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PermissionsScreen: React.FC = () => {
  const { 
    users, 
    updateUserPermissions, 
    goBack, 
    currentScreenParams, 
    customization,
    currentUser,
    addNotification
  } = useAppState();

  const userId = currentScreenParams?.userId;
  const targetUser = users.find(u => u.uid === userId);

  // Success screen state (Step #19)
  const [successMode, setSuccessMode] = useState(false);

  // States for permissions toggles
  const [addBudget, setAddBudget] = useState(false);
  const [seeTotalSpending, setSeeTotalSpending] = useState(false);
  const [addGiveMoney, setAddGiveMoney] = useState(false);
  const [viewAllTransactions, setViewAllTransactions] = useState(false);
  const [manageWantToBuy, setManageWantToBuy] = useState(false);
  const [appCustomization, setAppCustomization] = useState(false);
  const [manageUsers, setManageUsers] = useState(false);
  const [viewNotifications, setViewNotifications] = useState(false);

  useEffect(() => {
    if (targetUser && targetUser.permissions) {
      setAddBudget(targetUser.permissions.addBudget);
      setSeeTotalSpending(targetUser.permissions.seeTotalSpending);
      setAddGiveMoney(targetUser.permissions.addGiveMoney);
      setViewAllTransactions(targetUser.permissions.viewAllTransactions);
      setManageWantToBuy(targetUser.permissions.manageWantToBuy);
      setAppCustomization(targetUser.permissions.appCustomization);
      setManageUsers(targetUser.permissions.manageUsers);
      setViewNotifications(targetUser.permissions.viewNotifications);
    }
  }, [targetUser]);

  const handleSave = async () => {
    if (!targetUser) return;

    const newPerms = {
      addBudget,
      seeTotalSpending,
      addGiveMoney,
      viewAllTransactions,
      manageWantToBuy,
      appCustomization,
      manageUsers,
      viewNotifications,
    };

    await updateUserPermissions(targetUser.uid, newPerms);
    await addNotification('Permissions Updated', `Access details updated successfully for ${targetUser.fullName}`);
    setSuccessMode(true);
  };

  const handleDone = () => {
    setSuccessMode(false);
    goBack();
  };

  const isOwner = currentUser?.role === 'owner';
  const customPrimary = isOwner ? customization.primaryColor : '#22c55e';
  const customBtnColor = isOwner ? customization.btnColor : '#000000';

  if (!targetUser) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-white text-center">
        <HelpCircle className="w-12 h-12 text-gray-300" />
        <h4 className="font-bold text-gray-800 text-sm mt-3">User not found</h4>
        <button onClick={goBack} className="mt-4 px-4 py-2 text-xs bg-gray-100 rounded-xl">Back</button>
      </div>
    );
  }

  // Visual toggle switch helper component
  const FormToggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center justify-between w-full p-2.5 hover:bg-gray-50/70 rounded-xl transition text-left"
    >
      <span className="text-xs font-bold text-gray-700">{label}</span>
      <div>
        {value ? (
          <ToggleRight className="w-10 h-10 transition-colors" style={{ color: customPrimary }} />
        ) : (
          <ToggleLeft className="w-10 h-10 text-gray-300 transition-colors" />
        )}
      </div>
    </button>
  );

  return (
    <AnimatePresence mode="wait">
      {/* STEP 19: SUCCESS SCREEN */}
      {successMode ? (
        <motion.div 
          key="success_screen"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col justify-between p-6 bg-white"
        >
          {/* Back button hidden on success screen */}
          <div className="h-4" />

          {/* Success center content */}
          <div className="text-center my-auto space-y-4">
            <div className="relative inline-block">
              <motion.div 
                initial={{ rotate: -15, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                className="w-20 h-20 bg-green-50 border-2 border-green-100 rounded-full flex items-center justify-center text-green-500 mx-auto"
              >
                <CheckCircle2 className="w-12 h-12" style={{ color: customPrimary }} />
              </motion.div>
              <div className="absolute top-0 right-0 w-4 h-4 bg-amber-400 rounded-full animate-ping" />
            </div>

            <div className="space-y-1.5 max-w-sm mx-auto">
              <h2 className="text-xl font-bold text-gray-900">Permissions Updated</h2>
              <p className="text-xs text-gray-500 font-medium">
                Access updated successfully for <strong className="text-gray-900 font-bold">{targetUser.fullName}</strong>.
              </p>
            </div>
          </div>

          {/* Done Button */}
          <div className="mb-4">
            <button 
              id="permissions_done_btn"
              onClick={handleDone}
              className="w-full py-3.5 text-white font-semibold text-sm rounded-xl tracking-wide shadow-md transition-all active:scale-[0.98]"
              style={{ backgroundColor: customBtnColor }}
            >
              Done
            </button>
          </div>
        </motion.div>
      ) : (
        /* STEP 18: ACCESS & PERMISSIONS CONFIGURATION */
        <motion.div 
          key="permissions_form"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col justify-between p-5 bg-white overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mt-2 mb-4">
            <button 
              onClick={goBack} 
              className="p-1 px-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center font-semibold text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Cancel
            </button>
            <h3 className="font-bold text-gray-900 text-sm">
              Access & Permissions
            </h3>
            <button 
              onClick={handleSave}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
          </div>

          <div className="space-y-4 max-w-[360px] mx-auto w-full flex-1">
            <div className="border border-indigo-50 bg-indigo-50/25 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black">
                {targetUser.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-xs">Grant Access for {targetUser.fullName}</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Enable the modules this user can access (just like owner)</p>
              </div>
            </div>

            {/* Checkboxes Toggle Blocks */}
            <div className="space-y-1 bg-gray-50/50 border border-gray-100 p-2.5 rounded-2xl max-h-[380px] overflow-y-auto">
              <FormToggle label="Add Budget" value={addBudget} onChange={setAddBudget} />
              <FormToggle label="See Total Spending" value={seeTotalSpending} onChange={setSeeTotalSpending} />
              <FormToggle label="Add / Give Money" value={addGiveMoney} onChange={setAddGiveMoney} />
              <FormToggle label="View All Transactions" value={viewAllTransactions} onChange={setViewAllTransactions} />
              <FormToggle label="Manage Want to Buy Items" value={manageWantToBuy} onChange={setManageWantToBuy} />
              <FormToggle label="App Customization" value={appCustomization} onChange={setAppCustomization} />
              <FormToggle label="Manage Users & Access" value={manageUsers} onChange={setManageUsers} />
              <FormToggle label="View Notifications" value={viewNotifications} onChange={setViewNotifications} />
            </div>

            <button 
              id="permissions_save_btn"
              onClick={handleSave}
              className="w-full py-3 text-white font-semibold text-sm rounded-xl tracking-wide shadow-md transition-all active:scale-[0.98] mt-3"
              style={{ backgroundColor: customBtnColor }}
            >
              Save Access
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
