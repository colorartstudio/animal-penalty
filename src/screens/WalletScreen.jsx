import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Button } from '../components/ui/Base';
import { formatUSD, formatMPH } from '../utils/formatters';
import { ArrowRightLeft } from 'lucide-react';

export const WalletScreen = () => {
  const { currentWallet, transact, route, currentUser, setBank } = useContext(AppContext);
  const [tab, setTab] = useState(route.params?.tab || 'balance');
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState('Polygon');
  const [token, setToken] = useState('USDT');

  const handleDeposit = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < 1) return alert('Mínimo $1');
    transact(currentUser.id, 'deposit', val, 0, { token, network });
    alert(`Depósito Simulado de $${val} concluído!`);
    setAmount(''); setTab('balance');
  };

  const handleSwap = (direction) => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return alert('Valor inválido');
    if (direction === 'USD_TO_MPH') {
      if (currentWallet.balanceUSD < val) return alert('Saldo insuficiente');
      const grossMPH = val * 100;
      const burn = grossMPH * 0.02;
      const netMPH = grossMPH - burn;
      transact(currentUser.id, 'swap_usd_to_mph', -val, netMPH, { burn });
      setBank(prev => ({ ...prev, burnedMPH: prev.burnedMPH + burn }));
      alert(`Swap concluído! Recebeu ${netMPH} MPH. (Queima de ${burn} MPH)`);
    } else {
      if (currentWallet.balanceMPH < val) return alert('Saldo insuficiente');
      const grossUSD = val / 100;
      const burn = grossUSD * 0.02;
      const netUSD = grossUSD - burn;
      transact(currentUser.id, 'swap_mph_to_usd', netUSD, -val, { burn });
      setBank(prev => ({ ...prev, burnedUSD: prev.burnedUSD + burn }));
      alert(`Swap concluído! Recebeu $${netUSD.toFixed(2)}. (Queima de $${burn.toFixed(2)})`);
    }
    setAmount(''); setTab('balance');
  };

  const handleWithdraw = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < 20) return alert('Mínimo de saque é $20');
    if (currentWallet.balanceUSD < val) return alert('Saldo USD insuficiente');
    const fee = val * 0.02;
    const net = val - fee;
    transact(currentUser.id, 'withdrawal', -val, 0, { fee, net, token, network });
    alert(`Saque Simulado processado! Você recebeu $${net.toFixed(2)} (Taxa de $${fee.toFixed(2)} aplicada).`);
    setAmount(''); setTab('balance');
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex bg-white rounded-xl border-4 border-black overflow-hidden mb-4">
        {['balance', 'deposit', 'swap', 'withdraw'].map(t => (
          <button 
            key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 font-black uppercase text-xs ${tab === t ? 'bg-yellow-400 border-b-4 border-black' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'balance' && (
        <Card className="text-center space-y-6">
          <div>
            <p className="font-bold text-gray-500 uppercase">Seu Saldo USD</p>
            <p className="text-4xl font-black text-green-600">{formatUSD(currentWallet.balanceUSD)}</p>
          </div>
          <div className="h-1 bg-black rounded-full w-1/2 mx-auto"></div>
          <div>
            <p className="font-bold text-gray-500 uppercase">Suas Moedas (MPH)</p>
            <p className="text-3xl font-black text-blue-600">{formatMPH(currentWallet.balanceMPH)}</p>
            {currentWallet.lockedMPH > 0 && <p className="text-sm font-bold text-orange-500 mt-1">🔒 {currentWallet.lockedMPH} MPH travados em partida</p>}
          </div>
        </Card>
      )}

      {tab === 'deposit' && (
        <Card className="space-y-4">
          <h2 className="font-black text-xl uppercase border-b-4 border-black pb-2">Depositar USD</h2>
          <div className="grid grid-cols-2 gap-2">
            <select value={token} onChange={e=>setToken(e.target.value)} className="border-4 border-black rounded-xl p-2 font-bold"><option value="USDT">USDT</option><option value="USDC">USDC</option></select>
            <select value={network} onChange={e=>setNetwork(e.target.value)} className="border-4 border-black rounded-xl p-2 font-bold"><option value="Polygon">Polygon</option><option value="Arbitrum">Arbitrum</option><option value="BEP-20">BEP-20</option></select>
          </div>
          <input type="number" placeholder="Valor em USD (Min $1)" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full border-4 border-black rounded-xl p-3 font-bold text-lg" />
          <Button className="w-full" onClick={handleDeposit}>Confirmar Depósito</Button>
        </Card>
      )}

      {tab === 'swap' && (
        <Card className="space-y-4">
          <h2 className="font-black text-xl uppercase border-b-4 border-black pb-2">Swap Mercado</h2>
          <p className="text-xs font-bold text-gray-500">Taxa de queima: 2% em qualquer direção. 1 USD = 100 MPH.</p>
          <input type="number" placeholder="Valor a converter" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full border-4 border-black rounded-xl p-3 font-bold text-lg" />
          <div className="flex gap-2">
            <Button className="flex-1 bg-green-500" onClick={() => handleSwap('USD_TO_MPH')}>USD → MPH</Button>
            <Button className="flex-1 bg-blue-500" onClick={() => handleSwap('MPH_TO_USD')}>MPH → USD</Button>
          </div>
        </Card>
      )}

      {tab === 'withdraw' && (
        <Card className="space-y-4">
          <h2 className="font-black text-xl uppercase border-b-4 border-black pb-2">Sacar USD</h2>
          <p className="text-xs font-bold text-gray-500">Mínimo: $20. Taxa de saque: 2%.</p>
          <input type="text" placeholder="Endereço da Carteira" className="w-full border-4 border-black rounded-xl p-3 font-bold text-sm" />
          <input type="number" placeholder="Valor em USD" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full border-4 border-black rounded-xl p-3 font-bold text-lg mt-2" />
          <Button variant="danger" className="w-full" onClick={handleWithdraw}>Solicitar Saque</Button>
        </Card>
      )}
    </div>
  );
};
