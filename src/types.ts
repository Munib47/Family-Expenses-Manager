export interface UserPermissions {
  addBudget: boolean;
  seeTotalSpending: boolean;
  addGiveMoney: boolean;
  viewAllTransactions: boolean;
  manageWantToBuy: boolean;
  appCustomization: boolean;
  manageUsers: boolean;
  viewNotifications: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: 'owner' | 'authorized_user';
  permissions?: UserPermissions;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  details?: string;
  userId: string;
  userEmail: string;
  userName: string;
  month: string; // YYYY-MM
}

export interface WantToBuyItem {
  id: string;
  name: string;
  quantity: number;
  checked: boolean;
  userId: string;
  userName: string;
  month: string; // e.g. "June 2026" or YYYY-MM
}

export interface GiveMoneyTransaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  purpose: string;
  date: string; // YYYY-MM-DD
  addedBy: string;
}

export interface MonthlyBudget {
  month: string; // YYYY-MM
  amount: number;
  setBy: string;
  createdAt?: string; // Exact date of setting the budget
  userEmail?: string; // Email of the user who set the budget
}

export interface AppCustomization {
  bgColor: string; // hex
  textColor: string; // hex
  primaryColor: string; // hex
  btnColor: string; // hex
  chkColor: string; // hex
  delBtnColor: string; // hex
  currency?: string; // PKR, USD, etc.
  currencyScope?: 'global' | 'specific'; // applies to whole app or specific users
  userCurrencies?: Record<string, string>; // mapping from user ID to selected currency
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read?: boolean;
}
