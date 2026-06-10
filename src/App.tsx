import React from 'react';
import { StateProvider, useAppState } from './context/StateContext';
import { MobileFrame } from './components/MobileFrame';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { ChooseOptionScreen } from './components/ChooseOptionScreen';
import { SelectMonthScreen } from './components/SelectMonthScreen';
import { ExpenseListScreen } from './components/ExpenseListScreen';
import { AddEditExpenseScreen } from './components/AddEditExpenseScreen';
import { WantToBuyScreen } from './components/WantToBuyScreen';
import { AddEditBuyItemScreen } from './components/AddEditBuyItemScreen';
import { BudgetScreen } from './components/BudgetScreen';
import { GiveMoneyScreen } from './components/GiveMoneyScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { CustomizationScreen } from './components/CustomizationScreen';
import { ManageUsersScreen } from './components/ManageUsersScreen';
import { PermissionsScreen } from './components/PermissionsScreen';
import { Loader2 } from 'lucide-react';

const CombinedAppContent: React.FC = () => {
  // App Content Force Save
  const { currentScreen, loading } = useAppState();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white p-6">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        <span className="text-xs text-gray-500 font-semibold mt-2.5">Syncing accounts...</span>
      </div>
    );
  }

  // Routing manager based on current screen ID
  switch (currentScreen) {
    case 'login':
      return <LoginScreen />;
    case 'register':
      return <RegisterScreen />;
    case 'choose-option':
      return <ChooseOptionScreen />;
    case 'select-month':
      return <SelectMonthScreen />;
    case 'expense-list':
      return <ExpenseListScreen />;
    case 'add-expense':
      return <AddEditExpenseScreen />;
    case 'want-to-buy':
      return <WantToBuyScreen />;
    case 'add-buy-item':
      return <AddEditBuyItemScreen />;
    case 'budget-set':
      return <BudgetScreen />;
    case 'give-money':
      return <GiveMoneyScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'customization':
      return <CustomizationScreen />;
    case 'manage-users':
      return <ManageUsersScreen />;
    case 'permissions-set':
      return <PermissionsScreen />;
    default:
      return <LoginScreen />;
  }
};

export default function App() {
  return (
    <StateProvider>
      <MobileFrame>
        <CombinedAppContent />
      </MobileFrame>
    </StateProvider>
  );
}
