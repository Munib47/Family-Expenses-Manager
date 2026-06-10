import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  Expense, 
  WantToBuyItem, 
  GiveMoneyTransaction, 
  MonthlyBudget, 
  AppCustomization, 
  AppNotification,
  UserPermissions
} from '../types';
import { SmartDBService, auth } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

interface StateContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  expenses: Expense[];
  wantToBuyItems: WantToBuyItem[];
  giveMoneyTransactions: GiveMoneyTransaction[];
  budgets: MonthlyBudget[];
  notifications: AppNotification[];
  customization: AppCustomization;
  loading: boolean;
  activeMonth: string; // YYYY-MM
  currentScreen: string; // Screen ID
  currentScreenParams: any; // navigation params
  activeFlow: 'expense' | 'buy' | null; // Selected flow option
  firebaseMode: 'firebase' | 'local';
  
  // Auth methods
  login: (email: string, pass: string) => Promise<void>;
  register: (fullName: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Navigation
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
  setActiveMonth: (month: string) => void;
  setActiveFlow: (flow: 'expense' | 'buy' | null) => void;

  // DB Methods
  addExpense: (expense: Omit<Expense, 'id' | 'userId' | 'userEmail' | 'userName' | 'month'>) => Promise<void>;
  editExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addWantToBuyItem: (item: { name: string; quantity: number }) => Promise<void>;
  editWantToBuyItem: (id: string, item: { name: string; quantity: number }) => Promise<void>;
  toggleWantToBuyItem: (id: string) => Promise<void>;
  deleteWantToBuyItem: (id: string) => Promise<void>;
  setMonthlyBudget: (month: string, amount: number) => Promise<void>;
  addGiveMoneyTransaction: (userId: string, amount: number, purpose: string, date: string) => Promise<void>;
  updateUserPermissions: (userId: string, permissions: UserPermissions) => Promise<void>;
  removeUserAccess: (userId: string) => Promise<void>;
  updateCustomization: (custom: Partial<AppCustomization>) => Promise<void>;
  addNotification: (title: string, message: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  
  // Currency helpers
  getCurrencySymbol: (uid?: string) => string;
  formatCurrency: (amount: number, uid?: string) => string;
  clearAllDummyData: () => Promise<void>;
}

const defaultCustomization: AppCustomization = {
  bgColor: '#ffffff',
  textColor: '#000000',
  primaryColor: '#2dd4bf', // Teal accent is beautiful
  btnColor: '#ffffff',
  chkColor: '#2dd4bf',
  delBtnColor: '#ef4444', // red-500
  currency: 'PKR',
  currencyScope: 'global',
  userCurrencies: {},
};

const defaultPermissions: UserPermissions = {
  addBudget: false,
  seeTotalSpending: true,
  addGiveMoney: false,
  viewAllTransactions: false,
  manageWantToBuy: true,
  appCustomization: false,
  manageUsers: false,
  viewNotifications: false,
};

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [wantToBuyItems, setWantToBuyItems] = useState<WantToBuyItem[]>([]);
  const [giveMoneyTransactions, setGiveMoneyTransactions] = useState<GiveMoneyTransaction[]>([]);
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [customization, setCustomization] = useState<AppCustomization>(defaultCustomization);
  const [loading, setLoading] = useState(true);
  const [firebaseMode, setFirebaseMode] = useState<'firebase' | 'local'>('firebase');
  
  // Navigation stack
  const [navigationHistory, setNavigationHistory] = useState<Array<{ screen: string; params: any }>>(() => {
    const saved = sessionStorage.getItem('navigationHistory');
    return saved ? JSON.parse(saved) : [{ screen: 'login', params: {} }];
  });
  const currentScreenState = navigationHistory[navigationHistory.length - 1] || { screen: 'login', params: {} };
  const currentScreen = currentScreenState.screen;
  const currentScreenParams = currentScreenState.params;

  // Selected state
  const [activeMonth, setActiveMonth] = useState<string>(() => {
    return sessionStorage.getItem('activeMonth') || '2026-06'; // June 2026 as default from flow
  });
  const [activeFlow, setActiveFlow] = useState<'expense' | 'buy' | null>(() => {
    const saved = sessionStorage.getItem('activeFlow');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    sessionStorage.setItem('navigationHistory', JSON.stringify(navigationHistory));
  }, [navigationHistory]);

  useEffect(() => {
    sessionStorage.setItem('activeMonth', activeMonth);
  }, [activeMonth]);

  useEffect(() => {
    if (activeFlow) {
      sessionStorage.setItem('activeFlow', JSON.stringify(activeFlow));
    } else {
      sessionStorage.removeItem('activeFlow');
    }
  }, [activeFlow]);

  // Sync mode based on service fallback
  useEffect(() => {
    const checkInterval = setInterval(() => {
      setFirebaseMode(SmartDBService.isFallbackActive() ? 'local' : 'firebase');
    }, 1000);
    return () => clearInterval(checkInterval);
  }, []);

  // Handle Firebaseauth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch original user details from Realtime Database
        try {
          const profile = await SmartDBService.get(`users/${firebaseUser.uid}`);
          if (profile) {
            setCurrentUser(profile);
            setNavigationHistory(prev => {
              const lastScreen = prev[prev.length - 1]?.screen;
              if (lastScreen === 'login' || lastScreen === 'register') {
                return [...prev, { screen: 'choose-option', params: {} }];
              }
              return prev;
            });
          } else {
            // First time login user profile creation
            // Check if is first user in system -> make them owner
            const allUsers = await SmartDBService.get('users') || {};
            const isFirst = Object.keys(allUsers).length === 0;
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              role: isFirst ? 'owner' : 'authorized_user',
              permissions: isFirst ? undefined : defaultPermissions
            };
            await SmartDBService.set(`users/${firebaseUser.uid}`, newProfile);
            setCurrentUser(newProfile);
            setNavigationHistory(prev => {
              const lastScreen = prev[prev.length - 1]?.screen;
              if (lastScreen === 'login' || lastScreen === 'register') {
                return [...prev, { screen: 'choose-option', params: {} }];
              }
              return prev;
            });
          }
        } catch (err) {
          // Setup local fallback user profiles directly
          const localProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || 'user@example.com',
            fullName: 'Family Admin',
            role: 'owner'
          };
          setCurrentUser(localProfile);
          setNavigationHistory(prev => {
            const lastScreen = prev[prev.length - 1]?.screen;
            if (lastScreen === 'login' || lastScreen === 'register') {
              return [...prev, { screen: 'choose-option', params: {} }];
            }
            return prev;
          });
        }
      } else {
        setCurrentUser(null);
        setNavigationHistory([{ screen: 'login', params: {} }]);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Auth state error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Database listeners - only trigger when user is authenticated
  useEffect(() => {
    if (!currentUser) return;

    // 1. Sync User list
    const unsubUsers = SmartDBService.onValue('users', (data) => {
      if (data) {
        const uList: UserProfile[] = Object.values(data);
        setUsers(uList);
      } else {
        setUsers([]);
      }
    });

    // 2. Sync Expenses
    const unsubExpenses = SmartDBService.onValue('expenses', (data) => {
      if (data) {
        const eList: Expense[] = Object.keys(data).map(key => ({
          ...data[key],
          id: data[key].id || key
        }));
        setExpenses(eList);
      } else {
        setExpenses([]);
      }
    });

    // 3. Sync Want to Buy Items
    const unsubBuy = SmartDBService.onValue('wantToBuy', (data) => {
      if (data) {
        const bList: WantToBuyItem[] = Object.keys(data).map(key => ({
          ...data[key],
          id: data[key].id || key
        }));
        setWantToBuyItems(bList);
      } else {
        setWantToBuyItems([]);
      }
    });

    // 4. Sync Special Transactions
    const unsubTx = SmartDBService.onValue('transactions', (data) => {
      if (data) {
        const tList: GiveMoneyTransaction[] = Object.values(data);
        setGiveMoneyTransactions(tList);
      } else {
        setGiveMoneyTransactions([]);
      }
    });

    // 5. Sync Budgets
    const unsubBudgets = SmartDBService.onValue('budgets', (data) => {
      if (data) {
        const bList: MonthlyBudget[] = Object.values(data);
        setBudgets(bList);
      } else {
        setBudgets([]);
      }
    });

    // 6. Sync Customizations
    const unsubCustom = SmartDBService.onValue('customization', (data) => {
      if (data) {
        setCustomization({ ...defaultCustomization, ...data });
      } else {
        setCustomization(defaultCustomization);
      }
    });

    // 7. Sync Notifications
    const unsubNotifications = SmartDBService.onValue('notifications', (data) => {
      if (data) {
        const nList: AppNotification[] = Object.values(data);
        setNotifications(nList.sort((a,b) => b.timestamp - a.timestamp));
      } else {
        setNotifications([]);
      }
    });

    return () => {
      unsubUsers();
      unsubExpenses();
      unsubBuy();
      unsubTx();
      unsubBudgets();
      unsubCustom();
      unsubNotifications();
    };
  }, [currentUser]);

  // Currency logic implementation
  const getCurrencySymbol = (uid?: string): string => {
    if (customization.currencyScope === 'specific' && uid && customization.userCurrencies?.[uid]) {
      return customization.userCurrencies[uid];
    }
    return customization.currency || 'PKR';
  };

  const formatCurrency = (amount: number, uid?: string): string => {
    const symbol = getCurrencySymbol(uid || currentUser?.uid);
    return `${symbol} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const clearAllDummyData = async () => {
    await SmartDBService.set('expenses', null);
    await SmartDBService.set('wantToBuy', null);
    await SmartDBService.set('transactions', null);
    await SmartDBService.set('budgets', null);
    await SmartDBService.set('notifications', null);
    
    // Also remove seeded demo users but keep the logged-in user profile
    const allUsers = await SmartDBService.get('users') || {};
    const filteredUsers: Record<string, any> = {};
    if (currentUser) {
      filteredUsers[currentUser.uid] = currentUser;
    }
    await SmartDBService.set('users', filteredUsers);
  };

  // Navigation handlers
  const navigate = (screen: string, params: any = {}) => {
    setNavigationHistory(prev => [...prev, { screen, params }]);
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      setNavigationHistory(prev => prev.slice(0, prev.length - 1));
    }
  };

  // Auth Operations
  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      console.warn("Real Auth failed, using smart browser emulation:", err);
      // Fallback auth emulation
      SmartDBService.enableFallbackMode('auth-emulation');
      const allRegisteredUsers = await SmartDBService.get('users') || {};
      let foundUser = Object.values(allRegisteredUsers).find((u: any) => u.email === email) as UserProfile | undefined;
      
      if (!foundUser) {
        // Bootstrap standard owner account for default login
        if (email === 'owner@example.com') {
          foundUser = {
            uid: 'u_owner',
            email: 'owner@example.com',
            fullName: 'Munib Ahmad (Owner)',
            role: 'owner'
          };
          await SmartDBService.set('users/u_owner', foundUser);
        } else {
          throw new Error(err.message || 'Check credentials.');
        }
      }
      
      setCurrentUser(foundUser);
      navigate('choose-option');
      setLoading(false);
    }
  };

  const register = async (fullName: string, email: string, pass: string) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      console.warn("Real Register failed, creating local profile:", err);
      SmartDBService.enableFallbackMode('auth-emulation');
      
      const userId = `u_${Date.now()}`;
      const allUsers = await SmartDBService.get('users') || {};
      const isFirst = Object.keys(allUsers).length === 0 || email === 'owner@example.com';
      
      const newProfile: UserProfile = {
        uid: userId,
        email,
        fullName,
        role: isFirst ? 'owner' : 'authorized_user',
        permissions: isFirst ? undefined : defaultPermissions
      };
      
      await SmartDBService.set(`users/${userId}`, newProfile);
      setCurrentUser(newProfile);
      navigate('choose-option');
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn("Sign Out Error:", err);
    }
    setCurrentUser(null);
    setNavigationHistory([{ screen: 'login', params: {} }]);
    setLoading(false);
  };

  // Database additions
  const addExpense = async (expenseData: any) => {
    if (!currentUser) return;
    const finalData = {
      ...expenseData,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      userName: currentUser.fullName,
      month: activeMonth
    };

    const expId = await SmartDBService.push('expenses', finalData);
    
    // Trigger notification
    const formattedAmount = formatCurrency(expenseData.amount, currentUser.uid);
    await addNotification(
      'Expense Added',
      `${currentUser.fullName} added expense "${expenseData.title}" (${activeMonth}): ${formattedAmount}`
    );
  };

  const editExpense = async (id: string, expenseData: any) => {
    if (!currentUser) return;
    const existingExp = expenses.find(e => e.id === id);
    if (!existingExp) return;

    const updated = {
      ...existingExp,
      ...expenseData
    };

    await SmartDBService.set(`expenses/${id}`, updated);

    // Trigger Notification for updates (view 8 in flow)
    const formattedOld = formatCurrency(existingExp.amount, existingExp.userId);
    const formattedNew = formatCurrency(expenseData.amount, existingExp.userId);
    await addNotification(
      'Expense Updated',
      `${currentUser.fullName} has updated an expense (${existingExp.title}) in ${activeMonth}. Amount: ${formattedOld} → ${formattedNew}`
    );
  };

  const deleteExpense = async (id: string) => {
    if (!currentUser) return;
    const existingExp = expenses.find(e => e.id === id);
    if (!existingExp) return;

    await SmartDBService.remove(`expenses/${id}`);

    // Trigger Notification for deletes so the owner gets notified
    const formattedAmount = formatCurrency(existingExp.amount, existingExp.userId);
    await addNotification(
      'Expense Deleted',
      `${currentUser.fullName} has deleted the expense "${existingExp.title}" (${activeMonth}). Amount: ${formattedAmount}`
    );
  };

  const addWantToBuyItem = async (item: { name: string; quantity: number }) => {
    if (!currentUser) return;
    const newItem = {
      name: item.name,
      quantity: item.quantity,
      checked: false,
      userId: currentUser.uid,
      userName: currentUser.fullName,
      month: activeMonth
    };
    await SmartDBService.push('wantToBuy', newItem);
  };

  const editWantToBuyItem = async (id: string, item: { name: string; quantity: number }) => {
    const existingItem = wantToBuyItems.find(i => i.id === id);
    if (!existingItem) return;
    const updated = { ...existingItem, name: item.name, quantity: item.quantity };
    await SmartDBService.set(`wantToBuy/${id}`, updated);
  };

  const toggleWantToBuyItem = async (id: string) => {
    const existingItem = wantToBuyItems.find(i => i.id === id);
    if (!existingItem) return;
    const updated = { ...existingItem, checked: !existingItem.checked };
    await SmartDBService.set(`wantToBuy/${id}`, updated);
  };

  const deleteWantToBuyItem = async (id: string) => {
    await SmartDBService.remove(`wantToBuy/${id}`);
  };

  const setMonthlyBudget = async (month: string, amount: number) => {
    await SmartDBService.set(`budgets/month_${month.replace('-', '_')}`, {
      month,
      amount,
      setBy: currentUser?.fullName || 'Owner'
    });
  };

  const addGiveMoneyTransaction = async (userId: string, amount: number, purpose: string, date: string) => {
    const selectedUser = users.find(u => u.uid === userId);
    if (!selectedUser) return;

    const newTx = {
      userId,
      userName: selectedUser.fullName,
      userEmail: selectedUser.email,
      amount,
      purpose,
      date,
      addedBy: currentUser?.fullName || 'Owner'
    };

    await SmartDBService.push('transactions', newTx);
  };

  const updateUserPermissions = async (userId: string, permissions: UserPermissions) => {
    const targetUser = users.find(u => u.uid === userId);
    if (!targetUser) return;
    const updated = { ...targetUser, permissions };
    await SmartDBService.set(`users/${userId}`, updated);
  };

  const removeUserAccess = async (userId: string) => {
    await SmartDBService.remove(`users/${userId}`);
  };

  const updateCustomization = async (updated: Partial<AppCustomization>) => {
    const newCustom = { ...customization, ...updated };
    await SmartDBService.set('customization', newCustom);
  };

  const addNotification = async (title: string, message: string) => {
    const newNotif: AppNotification = {
      id: `nt_${Date.now()}`,
      title,
      message,
      timestamp: Date.now(),
      read: false
    };
    await SmartDBService.push('notifications', newNotif);
  };

  const clearNotifications = async () => {
    await SmartDBService.remove('notifications');
  };

  return (
    <StateContext.Provider value={{
      currentUser,
      users,
      expenses,
      wantToBuyItems,
      giveMoneyTransactions,
      budgets,
      notifications,
      customization,
      loading,
      activeMonth,
      currentScreen,
      currentScreenParams,
      activeFlow,
      firebaseMode,
      
      login,
      register,
      logout,
      
      navigate,
      goBack,
      setActiveMonth,
      setActiveFlow,
      
      addExpense,
      editExpense,
      deleteExpense,
      addWantToBuyItem,
      editWantToBuyItem,
      toggleWantToBuyItem,
      deleteWantToBuyItem,
      setMonthlyBudget,
      addGiveMoneyTransaction,
      updateUserPermissions,
      removeUserAccess,
      updateCustomization,
      addNotification,
      clearNotifications,
      
      getCurrencySymbol,
      formatCurrency,
      clearAllDummyData
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(StateContext);
  if (!context) throw new Error('useAppState must be used within StateProvider');
  return context;
};
