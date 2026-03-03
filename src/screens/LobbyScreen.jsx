import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Button } from '../components/ui/Base';
import { MascotAvatar } from '../components/ui/MascotAvatar';
import { Target, Users, Globe, Share2, PlusCircle, PlayCircle } from 'lucide-react';

export const LobbyScreen = () => {
  const { users, currentUser, currentWallet, navigate } = useContext(AppContext);
  const [stake, setStake] = useState(100);
  const [isTraining, setIsTraining] = useState(false);
  const [lobbyTab, setLobbyTab] = useState('local'); // 'local' | 'online'
  
  // Mock de Book de Apostas (Global)
  const [openBets, setOpenBets] = useState([
    { id: 'b1', hostName: 'TigerMaster', stake: 100, hostMascot: 'in' },
    { id: 'b2', hostName: 'EagleEye', stake: 500, hostMascot: 'us' },
    { id: 'b3', hostName: 'PandaKing', stake: 50, hostMascot: 'cn' },
  ]);

  const opponents = users.filter(u => u.id !== currentUser.id);
  const playableOpponents = [{ id: 'cpu', username: 'Convidado (P2 Local)', mascotId: 'cn' }, ...opponents];

  const startLocalMatch = (oppId) => {
    if (!isTraining && currentWallet.balanceMPH < stake) {
      return alert('Você não tem MPH suficiente!\n\nVá até a Home e clique no botão cinza "🛠 Dev: Airdrop $100" no final da tela para ganhar moedas de teste gratuitas, depois converta para MPH na Wallet!');
    }
    const matchId = `m_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    navigate('/match', { oppId, stake: isTraining ? 0 : stake, isTraining, matchId });
  };

  const startCpuTraining = () => {
    const matchId = `m_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    navigate('/match', { oppId: 'cpu', stake: 0, isTraining: true, matchId });
  };

  const handleCreateBet = () => {
    if (currentWallet.balanceMPH < stake) return alert('Saldo insuficiente!');
    const newBet = { 
      id: `b_${Date.now()}`, 
      hostName: currentUser.username, 
      stake, 
      hostMascot: currentUser.mascotId 
    };
    setOpenBets([newBet, ...openBets]);
    alert(`Sala criada! Aguardando oponente para aposta de ${stake} MPH...`);
  };

  const handleShareLink = () => {
    const origin = window.location.origin;
    const link = `${origin}/challenge/${currentUser.id}?stake=${stake}`;
    prompt("Copie o link abaixo e envie para seu amigo (Simulação):", link);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Modo Treino vs Aposta */}
      <Card className={`${isTraining ? 'bg-blue-300' : 'bg-yellow-400'} border-4 border-black transition-colors`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-black text-xl uppercase">Modo de Jogo</h2>
          <button 
            onClick={() => setIsTraining(!isTraining)}
            className={`px-4 py-2 rounded-xl border-4 border-black font-black uppercase text-xs ${isTraining ? 'bg-white text-blue-600' : 'bg-white text-yellow-600'}`}
          >
            {isTraining ? 'TREINO (GRÁTIS)' : 'APOSTA (REAL)'}
          </button>
        </div>

        {!isTraining ? (
          <>
            <label className="block font-bold text-sm mb-1 uppercase">Aposta (Stake em MPH)</label>
            <div className="flex gap-2 mb-4">
              {[50, 100, 500, 1000].map(val => (
                <button key={val} onClick={() => setStake(val)} className={`flex-1 font-black py-2 rounded-xl border-4 border-black transition-transform ${stake === val ? 'bg-white scale-105' : 'bg-yellow-200'}`}>
                  {val}
                </button>
              ))}
            </div>
            <p className="text-xs font-bold uppercase mb-4 text-center">Taxa do sistema: 10% de cada lado (Prêmio: 180%).</p>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-100 p-4 rounded-xl border-2 border-blue-500">
              <p className="font-black text-center text-blue-800 uppercase">MODO TREINO ATIVADO</p>
              <p className="text-xs text-center font-bold text-blue-600 mt-1">Jogue livremente sem gastar suas moedas MPH.</p>
            </div>
            
            <Button onClick={startCpuTraining} variant="action" className="w-full py-4 text-xl flex flex-col md:flex-row items-center justify-center gap-2 bg-blue-500 text-white hover:bg-blue-600 border-blue-800">
              <div className="flex items-center gap-2">
                <Target size={24} /> <span className="whitespace-nowrap">JOGAR CONTRA CPU</span>
              </div>
            </Button>
          </div>
        )}
      </Card>

      {!isTraining && (
        <>
          {/* Abas Local vs Online */}
          <div className="flex bg-white rounded-xl border-4 border-black overflow-hidden">
            <button 
              onClick={() => setLobbyTab('local')}
              className={`flex-1 py-3 font-black uppercase flex items-center justify-center gap-2 ${lobbyTab === 'local' ? 'bg-gray-200 border-b-4 border-black' : 'bg-white hover:bg-gray-50'}`}
            >
              <Users size={20} /> Local
            </button>
            <button 
              onClick={() => setLobbyTab('online')}
              className={`flex-1 py-3 font-black uppercase flex items-center justify-center gap-2 ${lobbyTab === 'online' ? 'bg-gray-200 border-b-4 border-black' : 'bg-white hover:bg-gray-50'}`}
            >
              <Globe size={20} /> Online
            </button>
          </div>

          {/* Conteúdo da Aba */}
          {lobbyTab === 'local' && (
            <div className="space-y-3 animate-fade-in">
              <Button onClick={() => startLocalMatch('cpu')} variant="action" className="w-full py-4 text-lg whitespace-nowrap flex items-center justify-center gap-2 bg-yellow-400 text-black hover:bg-yellow-500 border-black mb-4">
                <Users size={24} /> JOGAR AGORA (P2 LOCAL)
              </Button>

              <h3 className="font-black text-lg uppercase px-2">Desafiar Jogadores (Mesmo Celular)</h3>
              {playableOpponents.filter(opp => opp.id !== 'cpu').map(opp => (
                <Card key={opp.id} className="flex justify-between items-center p-3">
                  <div className="flex items-center gap-3">
                    <MascotAvatar mascotId={opp.mascotId} size="sm" />
                    <span className="font-black text-lg">{opp.username}</span>
                  </div>
                  <Button onClick={() => startLocalMatch(opp.id)} variant="action" className="px-4 py-2 text-sm">Desafiar</Button>
                </Card>
              ))}
            </div>
          )}

          {lobbyTab === 'online' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleCreateBet} className="bg-green-100 border-green-500 text-green-800 hover:bg-green-200 flex flex-col items-center py-4">
                  <PlusCircle size={32} className="mb-1" />
                  <span className="text-xs font-black uppercase">Criar Aposta</span>
                </Button>
                <Button onClick={handleShareLink} className="bg-blue-100 border-blue-500 text-blue-800 hover:bg-blue-200 flex flex-col items-center py-4">
                  <Share2 size={32} className="mb-1" />
                  <span className="text-xs font-black uppercase">Enviar Link</span>
                </Button>
              </div>

              <h3 className="font-black text-lg uppercase px-2 mt-4">Book de Apostas (Mundo)</h3>
              <div className="space-y-2">
                {openBets.map(bet => (
                  <Card key={bet.id} className="flex justify-between items-center p-3 border-2 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <MascotAvatar mascotId={bet.hostMascot} size="sm" />
                      <div>
                        <p className="font-black text-sm uppercase">{bet.hostName}</p>
                        <p className="text-xs font-bold text-green-600">Stake: {bet.stake} MPH</p>
                      </div>
                    </div>
                    <Button onClick={() => alert('Entrando na sala... (Simulação)')} variant="primary" className="px-4 py-2 text-xs">
                      Jogar
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
