import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Button } from '../components/ui/Base';
import { MascotAvatar } from '../components/ui/MascotAvatar';
import { MASCOTS } from '../utils/constants';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export const StoreScreen = () => {
  const { navigate, currentUser, currentWallet, buyItem, inventory } = useContext(AppContext);
  
  const myItems = inventory[currentUser.id] || [];
  
  const handleBuy = (mascot) => {
    const cost = 500; // Custo fixo por enquanto
    if (myItems.includes(mascot.id)) return;
    
    if (currentWallet.balanceMPH < cost) {
      alert('Saldo insuficiente!');
      return;
    }
    
    if (confirm(`Deseja comprar ${mascot.mascotName} por ${cost} MPH?`)) {
      buyItem(mascot.id, cost);
      alert('Compra realizada com sucesso!');
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
        </Button>
        <h2 className="text-2xl font-black uppercase">Loja de Times</h2>
      </div>
      
      <Card className="bg-yellow-100 border-yellow-500">
        <div className="flex items-center gap-3">
          <ShoppingBag size={32} className="text-yellow-700" />
          <div>
            <p className="font-bold text-sm text-yellow-800">Seu Saldo</p>
            <p className="text-2xl font-black text-yellow-900">{currentWallet.balanceMPH.toLocaleString()} MPH</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {MASCOTS.map(mascot => {
          const owned = myItems.includes(mascot.id);
          const isCurrent = currentUser.mascotId === mascot.id;
          
          return (
            <Card key={mascot.id} className={`flex flex-col items-center p-4 relative ${owned ? 'bg-gray-100 opacity-80' : 'bg-white'}`}>
              <MascotAvatar mascotId={mascot.id} size="md" />
              <h3 className="font-black mt-2 text-center text-sm">{mascot.countryName}</h3>
              <p className="text-xs text-gray-500 mb-3">{mascot.mascotName}</p>
              
              {owned ? (
                <div className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-black uppercase">
                  {isCurrent ? 'Selecionado' : 'Adquirido'}
                </div>
              ) : (
                <Button onClick={() => handleBuy(mascot)} variant="action" className="w-full text-xs py-2">
                  500 MPH
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
