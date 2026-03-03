import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Button } from '../components/ui/Base';
import { ScoreDots } from '../components/game/GameElements';
import { Trophy } from 'lucide-react';
import { audioManager } from '../utils/audio';

export const ResultScreen = () => {
  const { route, navigate, currentUser, soundEnabled } = useContext(AppContext);
  const match = route.params?.matchData;

  if (!match) return null;

  const isWinner = match.winnerId === currentUser.id;
  const isDraw = !match.winnerId;
  const payout = isWinner ? match.stake * 1.8 : 0;
  const isTraining = match.isTraining;

  React.useEffect(() => {
    if (soundEnabled) {
      if (isWinner) {
        audioManager.play('victory');
      } else if (!isDraw) {
        audioManager.play('defeat');
      }
    }
  }, [isWinner, isDraw, soundEnabled]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 text-center">
      <Trophy size={80} className={`mx-auto ${isWinner ? 'text-yellow-400 animate-bounce' : 'text-gray-400'}`} />
      <h1 className="text-5xl font-black italic uppercase drop-shadow-[2px_2px_0_rgba(0,0,0,1)] text-white">
        {match.winnerId ? (isWinner ? 'VITÓRIA!' : 'DERROTA') : 'EMPATE'}
      </h1>
      
      <Card className="w-full max-w-sm p-4">
        <h2 className="font-black text-2xl border-b-4 border-black pb-2 mb-4">PLACAR FINAL</h2>
        <div className="flex justify-around items-center text-5xl font-black mb-4">
          <span className={isWinner ? 'text-green-600' : ''}>{match.finalScore.p1}</span>
          <span className="text-gray-400 text-2xl">X</span>
          <span className={!isWinner ? 'text-red-600' : ''}>{match.finalScore.p2}</span>
        </div>
        
        <div className="mb-4 flex flex-col items-center gap-2 bg-gray-100 p-3 rounded-xl border-4 border-black">
          <p className="font-bold text-xs uppercase text-gray-500">Histórico de Chutes</p>
          <div className="flex justify-between w-full px-2">
             <div className="flex flex-col items-center gap-1">
               <span className="text-[10px] font-black uppercase">{match.p1Username}</span>
               <ScoreDots kicks={match.logs.filter(l => l.attacker === match.p1Username)} />
             </div>
             <div className="flex flex-col items-center gap-1">
               <span className="text-[10px] font-black uppercase">{match.p2Username}</span>
               <ScoreDots kicks={match.logs.filter(l => l.attacker === match.p2Username)} />
             </div>
          </div>
        </div>

        {!isTraining ? (
          <div className="bg-yellow-100 p-3 rounded-xl border-4 border-black text-left">
            <p className="font-bold text-sm text-gray-600 uppercase">Resumo Financeiro</p>
            <div className="flex justify-between font-black mt-2"><span>Aposta:</span><span>-{match.stake} MPH</span></div>
            <div className="flex justify-between font-black mt-1 text-green-600"><span>Prêmio:</span><span>+{payout} MPH</span></div>
            <div className="flex justify-between font-black mt-1 text-blue-600 pt-2 border-t-2 border-gray-300">
              <span>Lucro Líquido:</span>
              <span>{payout > 0 ? `+${payout - match.stake}` : `-${match.stake}`} MPH</span>
            </div>
          </div>
        ) : (
          <div className="bg-blue-100 p-3 rounded-xl border-4 border-blue-500 text-center">
            <p className="font-black text-lg text-blue-800 uppercase">TREINO CONCLUÍDO</p>
            <p className="text-xs font-bold text-blue-600">Nenhum saldo foi alterado nesta partida.</p>
          </div>
        )}
      </Card>

      <Button className="w-full max-w-sm text-xl" onClick={() => navigate('/')}>VOLTAR AO INÍCIO</Button>
    </div>
  );
};
