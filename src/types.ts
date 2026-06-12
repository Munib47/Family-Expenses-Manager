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
  createdAt?: number;
}

export interface WantToBuyItem {
  id: string;
  name: string;
  quantity: number;
  checked: boolean;
  userId: string;
  userName: string;
  month: string;
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
  createdAt?: string;
  userEmail?: string;
}

export interface AppCustomization {
  bgColor: string;
  textColor: string;
  primaryColor: string;
  btnColor: string;
  chkColor: string;
  delBtnColor: string;
  currency?: string;
  currencyScope?: 'global' | 'specific';
  userCurrencies?: Record<string, string>;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read?: boolean;
  readBy?: string[];
}

export interface GiveTakeRecord {
  id: string;
  type: 'give' | 'take'; // give = loaned out to someone, take = borrowed from someone
  title: string;
  personName: string;   // who you gave to / took from
  amount: number;
  date: string;         // YYYY-MM-DD (user-selected, drives sort order)
  details?: string;
  createdAt: number;    // server push timestamp — used only as same-day tiebreaker
  addedBy: string;      // owner uid
}