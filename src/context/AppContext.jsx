import React, { useState, useEffect, createContext, useMemo } from 'react';
import { storage } from '../utils/storage';
import { INITIAL_BANK } from '../utils/constants';
import { audioManager } from '../utils/audio';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [route, setRoute] = useState({ path: '/', params: {} });
  const [users, setUsers] = useState(() => storage.get('users', []));
  const [session, setSession] = useState(() => storage.get('session', { currentUserId: null }));
  const [wallets, setWallets] = useState(() => storage.get('wallets', {}));
  const [bank, setBank] = useState(() => storage.get('walletBank', INITIAL_BANK));
  const [ledger, setLedger] = useState(() => storage.get('ledger', []));
  const [matches, setMatches] = useState(() => storage.get('matches', []));
  const [posts, setPosts] = useState(() => storage.get('forum', []));
  
  // New features state
  const [language, setLanguage] = useState(() => storage.get('language', 'pt'));
  const [inventory, setInventory] = useState(() => storage.get('inventory', {})); // userId -> [itemIds]
  const [soundEnabled, setSoundEnabled] = useState(() => storage.get('soundEnabled', true));
  const [privacyScreenEnabled, setPrivacyScreenEnabled] = useState(() => storage.get('privacyScreenEnabled', true));

  useEffect(() => { 
    storage.set('soundEnabled', soundEnabled);
    audioManager.enabled = soundEnabled; // Sincroniza direto
    if (!soundEnabled) audioManager.stopAmbience();
  }, [soundEnabled]);

  useEffect(() => { storage.set('users', users); }, [users]);
  useEffect(() => { storage.set('session', session); }, [session]);
  useEffect(() => { storage.set('wallets', wallets); }, [wallets]);
  useEffect(() => { storage.set('walletBank', bank); }, [bank]);
  useEffect(() => { storage.set('ledger', ledger); }, [ledger]);
  useEffect(() => { storage.set('matches', matches); }, [matches]);
  useEffect(() => { storage.set('forum', posts); }, [posts]);
  useEffect(() => { storage.set('language', language); }, [language]);
  useEffect(() => { storage.set('inventory', inventory); }, [inventory]);
  useEffect(() => { storage.set('soundEnabled', soundEnabled); }, [soundEnabled]);
  useEffect(() => { storage.set('privacyScreenEnabled', privacyScreenEnabled); }, [privacyScreenEnabled]);

  const currentUser = useMemo(() => users.find(u => u.id === session.currentUserId), [users, session]);
  const currentWallet = useMemo(() => {
    if (!session.currentUserId) return { balanceUSD: 0, balanceMPH: 0, lockedMPH: 0 };
    return wallets[session.currentUserId] || { balanceUSD: 0, balanceMPH: 0, lockedMPH: 0 };
  }, [wallets, session]);

  const navigate = (path, params = {}) => setRoute({ path, params });

  const registerUser = (username, pin, mascotId) => {
    const id = `u_${Date.now()}`;
    const newUser = { id, username, pinHash: btoa(pin), mascotId, createdAt: Date.now() };
    setUsers([...users, newUser]);
    setWallets({ ...wallets, [id]: { userId: id, balanceUSD: 0, balanceMPH: 0, lockedMPH: 0 } });
    setSession({ currentUserId: id });
    // Give default items if any
    setInventory(prev => ({ ...prev, [id]: [mascotId] }));
    navigate('/');
  };

  const loginUser = (username, pin) => {
    const user = users.find(u => u.username === username && u.pinHash === btoa(pin));
    if (user) { setSession({ currentUserId: user.id }); navigate('/'); return true; }
    return false;
  };

  const logout = () => { setSession({ currentUserId: null }); navigate('/auth'); };

  const transact = (userId, type, deltaUSD, deltaMPH, meta = {}) => {
    setWallets(prev => {
      const w = prev[userId] || { balanceUSD: 0, balanceMPH: 0, lockedMPH: 0 };
      
      // Ensure values are numbers to avoid NaN
      const currentUSD = Number(w.balanceUSD) || 0;
      const currentMPH = Number(w.balanceMPH) || 0;
      const currentLocked = Number(w.lockedMPH) || 0;
      
      const newUSD = Math.max(0, currentUSD + deltaUSD);
      const newMPH = Math.max(0, currentMPH + deltaMPH);
      
      const newLocked = meta.unlockAmount ? Math.max(0, currentLocked - meta.unlockAmount) : currentLocked;
      
      const newLedgerEvent = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        userId, ts: Date.now(), type, deltaUSD, deltaMPH,
        balanceUSD_after: newUSD, balanceMPH_after: newMPH, meta
      };
      
      setLedger(l => [newLedgerEvent, ...l]);
      return { ...prev, [userId]: { ...w, balanceUSD: newUSD, balanceMPH: newMPH, lockedMPH: newLocked } };
    });
  };

  const lockStake = (userId, amount) => {
    setWallets(prev => {
      const w = prev[userId];
      return { ...prev, [userId]: { ...w, balanceMPH: w.balanceMPH - amount, lockedMPH: w.lockedMPH + amount } };
    });
  };

  const unlockStake = (userId, amount, won, payoutAmount = 0) => {
    setWallets(prev => {
      const w = prev[userId];
      const newLocked = Math.max(0, w.lockedMPH - amount);
      const newBalance = w.balanceMPH + (won ? payoutAmount : 0);
      return { ...prev, [userId]: { ...w, lockedMPH: newLocked, balanceMPH: newBalance } };
    });
  };

  const airdrop = () => { 
    if(!currentUser) return;
    transact(currentUser.id, 'deposit', 100, 0, { note: 'Dev Airdrop' });
    transact(currentUser.id, 'swap_usd_to_mph', -50, 5000, { note: 'Dev Airdrop Swap' });
  };
  
  // Helper for buying items
  const buyItem = (itemId, cost) => {
    if (!currentUser) return false;
    if (currentWallet.balanceMPH < cost) return false;
    
    transact(currentUser.id, 'buy_item', 0, -cost, { itemId });
    setInventory(prev => ({
        ...prev,
        [currentUser.id]: [...(prev[currentUser.id] || []), itemId]
    }));
    return true;
  };

  return (
    <AppContext.Provider value={{
      route, navigate, currentUser, currentWallet, users, setUsers, bank, setBank, matches, setMatches,
      registerUser, loginUser, logout, transact, airdrop, lockStake, unlockStake, ledger,
      posts, setPosts, language, setLanguage, inventory, buyItem,
      soundEnabled, setSoundEnabled, privacyScreenEnabled, setPrivacyScreenEnabled
    }}>
      {children}
    </AppContext.Provider>
  );
};
