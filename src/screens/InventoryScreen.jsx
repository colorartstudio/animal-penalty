import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Button } from '../components/ui/Base';
import { MascotAvatar } from '../components/ui/MascotAvatar';
import { MASCOTS } from '../utils/constants';
import { ArrowLeft, Check } from 'lucide-react';

export const InventoryScreen = () => {
  const { navigate, currentUser, inventory, setUsers, users } = useContext(AppContext);
  
  const myItems = inventory[currentUser.id] || [];
  
  const handleSelect = (mascotId) => {
    // Update user's mascotId
    const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, mascotId } : u);
    setUsers(updatedUsers);
    // Force session refresh implicitly via AppContext users change
    alert('Time selecionado com sucesso!');
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
        </Button>
        <h2 className="text-2xl font-black uppercase">Meus Times</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {myItems.map(mascotId => {
          const mascot = MASCOTS.find(m => m.id === mascotId);
          if (!mascot) return null;
          
          const isCurrent = currentUser.mascotId === mascotId;
          
          return (
            <Card key={mascotId} className={`flex flex-col items-center p-4 ${isCurrent ? 'border-green-500 bg-green-50 ring-2 ring-green-300' : ''}`}>
              <MascotAvatar mascotId={mascotId} size="md" />
              <h3 className="font-black mt-2 text-center text-sm">{mascot.countryName}</h3>
              <p className="text-xs text-gray-500 mb-3">{mascot.mascotName}</p>
              
              {isCurrent ? (
                <div className="flex items-center gap-1 text-green-600 font-black text-xs uppercase">
                  <Check size={16} /> Em Uso
                </div>
              ) : (
                <Button onClick={() => handleSelect(mascotId)} variant="primary" className="w-full text-xs py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-400">
                  Selecionar
                </Button>
              )}
            </Card>
          );
        })}
        
        {myItems.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-500">
            Você ainda não tem times. Visite a loja!
          </div>
        )}
      </div>
      
      <Button variant="action" className="w-full mt-4" onClick={() => navigate('/store')}>
        Ir para a Loja
      </Button>
    </div>
  );
};
