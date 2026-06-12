import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  Expense, 
  WantToBuyItem, 
  GiveMoneyTransaction, 
  MonthlyBudget, 
  AppCustomization, 
  AppNotification,
  UserPermissions,
  GiveTakeRecord
} from '../types';
import { SmartDBService, auth } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, updateProfile } from 'firebase/auth';

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
  activeMonth: string;
  currentScreen: string;
  currentScreenParams: any;
  activeFlow: 'expense' | 'buy' | null;
  firebaseMode: 'firebase' | 'local';
  
  login: (email: string, pass: string) => Promise<void>;
  register: (fullName: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
  setActiveMonth: (month: string) => void;
  setActiveFlow: (flow: 'expense' | 'buy' | null) => void;

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
  markNotificationsRead: () => Promise<void>;
  dataLoading: boolean;

  giveTakeRecords: GiveTakeRecord[];
  addGiveTakeRecord: (record: Omit<GiveTakeRecord, 'id' | 'createdAt' | 'addedBy'>) => Promise<void>;
  editGiveTakeRecord: (id: string, data: Partial<GiveTakeRecord>) => Promise<void>;
  deleteGiveTakeRecord: (id: string) => Promise<void>;
  
  getCurrencySymbol: (uid?: string) => string;
  formatCurrency: (amount: number, uid?: string) => string;
  clearAllDummyData: () => Promise<void>;
}

const defaultCustomization: AppCustomization = {
  bgColor: '#ffffff',
  textColor: '#000000',
  primaryColor: '#2dd4bf',
  btnColor: '#ffffff',
  chkColor: '#2dd4bf',
  delBtnColor: '#ef4444',
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
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = sessionStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [wantToBuyItems, setWantToBuyItems] = useState<WantToBuyItem[]>([]);
  const [giveMoneyTransactions, setGiveMoneyTransactions] = useState<GiveMoneyTransaction[]>([]);
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [giveTakeRecords, setGiveTakeRecords] = useState<GiveTakeRecord[]>([]);
  const [customization, setCustomization] = useState<AppCustomization>(defaultCustomization);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [firebaseMode, setFirebaseMode] = useState<'firebase' | 'local'>('firebase');
  
  const [navigationHistory, setNavigationHistory] = useState<Array<{ screen: string; params: any }>>(() => {
    const saved = sessionStorage.getItem('navigationHistory');
    return saved ? JSON.parse(saved) : [{ screen: 'login', params: {} }];
  });
  const currentScreenState = navigationHistory[navigationHistory.length - 1] || { screen: 'login', params: {} };
  const currentScreen = currentScreenState.screen;
  const currentScreenParams = currentScreenState.params;

  const [activeMonth, setActiveMonth] = useState<string>(() => {
    return sessionStorage.getItem('activeMonth') || '2026-06';
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

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      setFirebaseMode(SmartDBService.isFallbackActive() ? 'local' : 'firebase');
    }, 1000);
    return () => clearInterval(checkInterval);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await SmartDBService.get(`users/${firebaseUser.uid}`);
          if (profile) {
            const emailLower = (firebaseUser.email || '').toLowerCase();
            const targetRole = emailLower === 'munibahmad47@gmail.com' ? 'owner' : 'authorized_user';
            if (profile.role !== targetRole) {
              profile.role = targetRole;
              await SmartDBService.set(`users/${firebaseUser.uid}`, profile);
            }
            setCurrentUser(profile);
            setNavigationHistory(prev => {
              const lastScreen = prev[prev.length - 1]?.screen;
              if (lastScreen === 'login' || lastScreen === 'register') {
                return [...prev, { screen: 'choose-option', params: {} }];
              }
              return prev;
            });
          } else {
            const emailLower = (firebaseUser.email || '').toLowerCase();
            const isOwner = emailLower === 'munibahmad47@gmail.com';
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              role: isOwner ? 'owner' : 'authorized_user',
              permissions: isOwner ? undefined : defaultPermissions
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
          const emailLower = (firebaseUser.email || '').toLowerCase();
          const targetRole = emailLower === 'munibahmad47@gmail.com' ? 'owner' : 'authorized_user';
          const localProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || 'user@example.com',
            fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            role: targetRole,
            permissions: targetRole === 'owner' ? undefined : defaultPermissions
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
        const savedUser = sessionStorage.getItem('currentUser');
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
          setLoading(false);
          return;
        }
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

  // Database listeners
  useEffect(() => {
    if (!currentUser) return;
    setDataLoading(true);
    let loadedCount = 0;
    const totalSources = 8;
    const markLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalSources) setDataLoading(false);
    };
    // Safety: force-clear loading after 4s if any path doesn't exist yet in Firebase
    const safetyTimer = setTimeout(() => setDataLoading(false), 4000);

    const unsubUsers = SmartDBService.onValue('users', (data) => {
      if (data) {
        const uList: UserProfile[] = Object.values(data);
        setUsers(uList);
      } else {
        setUsers([]);
      }
      markLoaded();
    });

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
      markLoaded();
    });

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
      markLoaded();
    });

    const unsubTx = SmartDBService.onValue('transactions', (data) => {
      if (data) {
        const tList: GiveMoneyTransaction[] = Object.values(data);
        setGiveMoneyTransactions(tList);
      } else {
        setGiveMoneyTransactions([]);
      }
      markLoaded();
    });

    const unsubBudgets = SmartDBService.onValue('budgets', (data) => {
      if (data) {
        const bList: MonthlyBudget[] = Object.values(data);
        setBudgets(bList);
      } else {
        setBudgets([]);
      }
      markLoaded();
    });

    const unsubCustom = SmartDBService.onValue('customization', (data) => {
      if (data) {
        setCustomization({ ...defaultCustomization, ...data });
      } else {
        setCustomization(defaultCustomization);
      }
      markLoaded();
    });

    const unsubNotifications = SmartDBService.onValue('notifications', (data) => {
      if (data) {
        const nList: AppNotification[] = Object.values(data);
        setNotifications(nList.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setNotifications([]);
      }
      markLoaded();
    });

    const unsubGiveTake = SmartDBService.onValue('giveTake', (data) => {
      if (data) {
        const list: GiveTakeRecord[] = Object.keys(data).map(key => ({
          ...data[key],
          id: data[key].id || key
        }));
        setGiveTakeRecords(list);
      } else {
        setGiveTakeRecords([]);
      }
      markLoaded();
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubUsers();
      unsubExpenses();
      unsubBuy();
      unsubTx();
      unsubBudgets();
      unsubCustom();
      unsubNotifications();
      unsubGiveTake();
    };
  }, [currentUser]);

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
    const filteredUsers: Record<string, any> = {};
    if (currentUser) {
      filteredUsers[currentUser.uid] = currentUser;
    }
    await SmartDBService.set('users', filteredUsers);
  };

  const navigate = (screen: string, params: any = {}) => {
    setNavigationHistory(prev => [...prev, { screen, params }]);
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      setNavigationHistory(prev => prev.slice(0, prev.length - 1));
    }
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      if (err.code !== 'auth/operation-not-allowed') {
        console.warn("Real Auth failed, using smart browser emulation:", err);
      }
      SmartDBService.enableFallbackMode('auth-emulation');
      const allRegisteredUsers = await SmartDBService.get('users') || {};
      let foundUser = Object.values(allRegisteredUsers).find((u: any) => u.email === email) as UserProfile | undefined;
      if (!foundUser) {
        if (email.toLowerCase() === 'munibahmad47@gmail.com') {
          foundUser = {
            uid: 'u_owner',
            email: 'munibahmad47@gmail.com',
            fullName: 'Munib Ahmad',
            role: 'owner'
          };
          await SmartDBService.set('users/u_owner', foundUser);
        } else {
          throw new Error(err.message || 'Check credentials.');
        }
      }
      if (foundUser) {
        const tempEmailLower = (foundUser.email || '').toLowerCase();
        const targetRole = tempEmailLower === 'munibahmad47@gmail.com' ? 'owner' : 'authorized_user';
        if (foundUser.role !== targetRole) {
          foundUser.role = targetRole;
          await SmartDBService.set(`users/${foundUser.uid}`, foundUser);
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
      const userCred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCred.user, { displayName: fullName });
      const emailLower = email.toLowerCase();
      const isOwner = emailLower === 'munibahmad47@gmail.com';
      const userProfile: UserProfile = {
        uid: userCred.user.uid,
        email,
        fullName,
        role: isOwner ? 'owner' : 'authorized_user',
        permissions: isOwner ? undefined : defaultPermissions
      };
      await SmartDBService.set(`users/${userCred.user.uid}`, userProfile);
      setCurrentUser(userProfile);
    } catch (err: any) {
      if (err.code !== 'auth/operation-not-allowed') {
        console.warn("Real Register failed, creating local profile:", err);
      }
      SmartDBService.enableFallbackMode('auth-emulation');
      const userId = `u_${Date.now()}`;
      const emailLower = email.toLowerCase();
      const isOwner = emailLower === 'munibahmad47@gmail.com';
      const newProfile: UserProfile = {
        uid: userId,
        email,
        fullName,
        role: isOwner ? 'owner' : 'authorized_user',
        permissions: isOwner ? undefined : defaultPermissions
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

  const addExpense = async (expenseData: any) => {
    if (!currentUser) return;
    const finalData = {
      ...expenseData,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      userName: currentUser.fullName,
      month: activeMonth,
      createdAt: Date.now()
    };
    await SmartDBService.push('expenses', finalData);
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
    const updated = { ...existingExp, ...expenseData };
    await SmartDBService.set(`expenses/${id}`, updated);
    const formattedOld = formatCurrency(existingExp.amount, existingExp.userId);
    const formattedNew = formatCurrency(expenseData.amount, existingExp.userId);
    await addNotification(
      'Expense Updated',
      `${currentUser.fullName} changed in ${existingExp.title}, Change the price from ${formattedOld} to ${formattedNew}`
    );
  };

  const deleteExpense = async (id: string) => {
    if (!currentUser) return;
    const existingExp = expenses.find(e => e.id === id);
    if (!existingExp) return;
    await SmartDBService.remove(`expenses/${id}`);
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
      setBy: currentUser?.fullName || 'Owner',
      createdAt: new Date().toISOString(),
      userEmail: currentUser?.email || ''
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
      read: false,
      readBy: []
    };
    await SmartDBService.push('notifications', newNotif);
  };

  const markNotificationsRead = async () => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    const unreadOnes = notifications.filter(n => !(n.readBy || []).includes(uid));
    for (const notif of unreadOnes) {
      const updated: AppNotification = {
        ...notif,
        readBy: [...(notif.readBy || []), uid],
        read: true
      };
      await SmartDBService.set(`notifications/${notif.id}`, updated);
    }
  };

  const addGiveTakeRecord = async (record: Omit<GiveTakeRecord, 'id' | 'createdAt' | 'addedBy'>) => {
    if (!currentUser) return;
    const newRecord: Omit<GiveTakeRecord, 'id'> = {
      ...record,
      createdAt: Date.now(),
      addedBy: currentUser.uid,
    };
    await SmartDBService.push('giveTake', newRecord);
  };

  const editGiveTakeRecord = async (id: string, data: Partial<GiveTakeRecord>) => {
    const existing = giveTakeRecords.find(r => r.id === id);
    if (!existing) return;
    await SmartDBService.set(`giveTake/${id}`, { ...existing, ...data });
  };

  const deleteGiveTakeRecord = async (id: string) => {
    await SmartDBService.remove(`giveTake/${id}`);
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
      markNotificationsRead,
      getCurrencySymbol,
      formatCurrency,
      clearAllDummyData,
      dataLoading,
      giveTakeRecords,
      addGiveTakeRecord,
      editGiveTakeRecord,
      deleteGiveTakeRecord,
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