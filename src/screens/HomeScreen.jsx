import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Button } from '../components/ui/Base';
import { MascotAvatar } from '../components/ui/MascotAvatar';
import { formatUSD, formatMPH } from '../utils/formatters';
import { ArrowDownCircle, ArrowRightLeft, ArrowUpCircle, Play } from 'lucide-react';

export const HomeScreen = () => {
  const { currentUser, currentWallet, navigate, airdrop } = useContext(AppContext);
  
  // Safe access to wallet
  const balanceUSD = currentWallet?.balanceUSD || 0;
  const balanceMPH = currentWallet?.balanceMPH || 0;

  return (
    <div className="space-y-6 pb-24">
      <Card className="bg-blue-500 text-black overflow-hidden relative">
        <div className="relative z-10 flex items-center gap-4">
          <MascotAvatar mascotId={currentUser.mascotId} size="lg" />
          <div>
            <h2 className="text-2xl font-black uppercase">Olá, {currentUser.username}!</h2>
            <p className="font-bold opacity-90 text-sm">Pronto para o chute final?</p>
          </div>
        </div>
        <div className="absolute right-0 top-0 opacity-20 text-8xl transform rotate-12 translate-x-4 -translate-y-4">⚽</div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-yellow-400 text-center cursor-pointer hover:bg-yellow-300" onClick={() => navigate('/wallet')}>
          <p className="font-black uppercase text-xs">Saldo USD</p>
          <p className="text-2xl font-black mt-1">{formatUSD(balanceUSD)}</p>
        </Card>
        <Card className="bg-green-400 text-center cursor-pointer hover:bg-green-300" onClick={() => navigate('/wallet')}>
          <p className="font-black uppercase text-xs">Suas Moedas</p>
          <p className="text-2xl font-black mt-1">{formatMPH(balanceMPH)}</p>
        </Card>
      </div>

      <Button variant="action" className="w-full text-3xl py-6 animate-pulse" onClick={() => navigate('/play')}>
        <div className="flex items-center justify-center gap-3 whitespace-nowrap">
          <Play size={32} fill="currentColor" /> JOGAR AGORA
        </div>
      </Button>

      <div className="grid grid-cols-3 gap-2">
        <Button variant="ghost" className="bg-white border-4 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex flex-col items-center p-2" onClick={() => navigate('/wallet', { tab: 'deposit' })}>
          <ArrowDownCircle size={24} className="mb-1 text-green-600" /> <span className="text-[10px] font-bold uppercase">Depositar</span>
        </Button>
        <Button variant="ghost" className="bg-white border-4 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex flex-col items-center p-2" onClick={() => navigate('/wallet', { tab: 'swap' })}>
          <ArrowRightLeft size={24} className="mb-1 text-blue-600" /> <span className="text-[10px] font-bold uppercase">Swap</span>
        </Button>
        <Button variant="ghost" className="bg-white border-4 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex flex-col items-center p-2" onClick={() => navigate('/wallet', { tab: 'withdraw' })}>
          <ArrowUpCircle size={24} className="mb-1 text-red-600" /> <span className="text-[10px] font-bold uppercase">Sacar</span>
        </Button>
      </div>

      <div className="text-center">
        <Button variant="ghost" className="text-xs bg-gray-200" onClick={airdrop}>🛠 Dev: Airdrop $100</Button>
      </div>
    </div>
  );
};
