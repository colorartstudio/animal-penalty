import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { MascotAvatar } from '../ui/MascotAvatar';
import { formatMPH } from '../../utils/formatters';
import { Home, MessageSquare, Swords, Wallet, Menu, User, Settings, Headset, Globe, LogOut } from 'lucide-react';

export const Header = () => {
  const { currentUser, navigate, currentWallet } = useContext(AppContext);
  if (!currentUser) return null;
  
  // Safe access to wallet properties
  const balanceMPH = currentWallet?.balanceMPH || 0;
  
  return (
    <header className="absolute top-0 left-0 right-0 h-16 bg-white border-b-4 border-black z-40 px-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <MascotAvatar mascotId={currentUser.mascotId} size="sm" />
        <div className="hidden sm:block">
          <p className="font-black leading-none uppercase">{currentUser.username}</p>
          <p className="text-[10px] font-bold text-gray-500">MVP Mode</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right bg-gray-100 px-3 py-1 rounded-xl border-2 border-black" onClick={() => navigate('/wallet')}>
          <p className="font-black text-blue-600 leading-none">{formatMPH(balanceMPH)}</p>
        </div>
      </div>
    </header>
  );
};

export const BottomNav = () => {
  const { route, navigate, currentUser, logout } = useContext(AppContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!currentUser || route.path.startsWith('/match')) return null;

  const handleNav = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      {isMenuOpen && (
        <div className="absolute inset-0 z-30 bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
      )}

      {isMenuOpen && (
        <div className="absolute bottom-24 right-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col overflow-hidden z-40 w-52 transition-transform origin-bottom-right">
          <button onClick={() => handleNav('/store')} className="flex items-center gap-3 p-3 font-black text-sm uppercase hover:bg-gray-100 border-b-2 border-black"><Wallet size={20}/> Loja de Times</button>
          <button onClick={() => handleNav('/inventory')} className="flex items-center gap-3 p-3 font-black text-sm uppercase hover:bg-gray-100 border-b-2 border-black"><User size={20}/> Meus Times</button>
          <button onClick={() => handleNav('/report')} className="flex items-center gap-3 p-3 font-black text-sm uppercase hover:bg-gray-100 border-b-2 border-black"><User size={20}/> Relatório</button>
          <button onClick={() => handleNav('/settings')} className="flex items-center gap-3 p-3 font-black text-sm uppercase hover:bg-gray-100 border-b-2 border-black"><Settings size={20}/> Configurações</button>
          <button onClick={() => handleNav('/support')} className="flex items-center gap-3 p-3 font-black text-sm uppercase hover:bg-gray-100 border-b-2 border-black"><Headset size={20}/> Support</button>
          <button onClick={() => handleNav('/languages')} className="flex items-center gap-3 p-3 font-black text-sm uppercase hover:bg-gray-100 border-b-2 border-black"><Globe size={20}/> Idiomas</button>
          <button onClick={() => { logout(); setIsMenuOpen(false); }} className="flex items-center gap-3 p-3 font-black text-sm uppercase bg-red-100 hover:bg-red-200 text-red-600"><LogOut size={20}/> Sair</button>
        </div>
      )}

      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t-4 border-black px-2 sm:px-6 flex justify-between items-center pb-safe z-40 h-20">
        <button onClick={() => handleNav('/')} className={`flex flex-col items-center w-14 transition-colors ${route.path === '/' ? 'text-blue-600' : 'text-gray-400 hover:text-black'}`}>
          <Home size={28} className={route.path === '/' ? 'animate-bounce' : ''} />
          <span className="text-[10px] font-black uppercase mt-1">Home</span>
        </button>

        <button onClick={() => handleNav('/forum')} className={`flex flex-col items-center w-14 transition-colors ${route.path === '/forum' ? 'text-blue-600' : 'text-gray-400 hover:text-black'}`}>
          <MessageSquare size={28} className={route.path === '/forum' ? 'animate-bounce' : ''} />
          <span className="text-[10px] font-black uppercase mt-1">Fórum</span>
        </button>

        <div className="relative -top-6 flex flex-col items-center">
          <button onClick={() => handleNav('/play')} className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-black flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:shadow-none ${route.path === '/play' ? 'bg-yellow-400 text-black scale-105' : 'bg-green-400 text-black hover:bg-green-500'}`}>
            <Swords size={32} className="sm:w-10 sm:h-10" />
          </button>
          <span className="absolute -bottom-4 text-[11px] font-black uppercase text-black bg-white px-3 py-0.5 rounded-full border-2 border-black">Lobby</span>
        </div>

        <button onClick={() => handleNav('/wallet')} className={`flex flex-col items-center w-14 transition-colors ${route.path === '/wallet' ? 'text-blue-600' : 'text-gray-400 hover:text-black'}`}>
          <Wallet size={28} className={route.path === '/wallet' ? 'animate-bounce' : ''} />
          <span className="text-[10px] font-black uppercase mt-1">Wallet</span>
        </button>

        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`flex flex-col items-center w-14 transition-colors ${isMenuOpen ? 'text-blue-600' : 'text-gray-400 hover:text-black'}`}>
          <Menu size={28} className={isMenuOpen ? 'animate-bounce' : ''} />
          <span className="text-[10px] font-black uppercase mt-1">Menu</span>
        </button>
      </nav>
    </>
  );
};
