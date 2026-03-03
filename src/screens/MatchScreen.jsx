import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Button } from '../components/ui/Base';
import { MascotAvatar } from '../components/ui/MascotAvatar';
import { ScoreDots, Goalkeeper, AnimatedBall } from '../components/game/GameElements';
import { ZONES, MASCOTS } from '../utils/constants';
import { MessageCircle, Info, X, ShieldCheck, Wallet } from 'lucide-react';
import { audioManager } from '../utils/audio';
import kickBtnImg from '../assets/images/botao_kick.svg';
import ballImg from '../assets/images/ball.svg';

export const MatchScreen = () => {
  const { route, currentUser, users, navigate, lockStake, transact, setBank, matches, setMatches, soundEnabled, ledger } = useContext(AppContext);
  const p1 = currentUser;
  const p2 = users.find(u => u.id === route.params?.oppId) || { id: 'cpu', username: 'Convidado', mascotId: 'br' };
  const stake = parseInt(route.params?.stake) || 0;
  const isTraining = route.params?.isTraining || false;
  const matchId = route.params?.matchId || `m_fallback_${Date.now()}`;

  const hasInitialized = React.useRef(false); // Ref para StrictMode

  const [hasStarted, setHasStarted] = useState(false);
  const [turn, setTurn] = useState(1); 
  const [phase, setPhase] = useState('INIT'); 
  const [score, setScore] = useState({ p1: 0, p2: 0 });
  const [logs, setLogs] = useState([]); 
  const [timer, setTimer] = useState(15);
  
  const [selectedZone, setSelectedZone] = useState(null);
  const [attackerPick, setAttackerPick] = useState(null);
  const [animState, setAnimState] = useState(null); 
  const [activeModal, setActiveModal] = useState(null); // 'emotes', 'team', null
  const [playerEmote, setPlayerEmote] = useState(null);
  
  // Determine Away Kit (if mascots are same)
  const isSameMascot = p1.mascotId === p2.mascotId;
  // P2 (Guest/CPU) gets Away Kit if same mascot
  const p2IsAway = isSameMascot; 

  const isP1Attacking = turn % 2 !== 0;
  const currentAttacker = isP1Attacking ? p1 : p2;
  const currentDefender = isP1Attacking ? p2 : p1;
  const defenderIsAway = isP1Attacking ? p2IsAway : false; // Only P2 can be away for now (simple logic)

  // Sound Effects
  useEffect(() => {
    if (hasStarted && soundEnabled) {
      console.log("MatchScreen: Starting ambience...");
      audioManager.play('ambience');
    }
    return () => {
      audioManager.stopAmbience();
    };
  }, [hasStarted, soundEnabled]);

  const [shakeNet, setShakeNet] = useState(false);

  useEffect(() => {
    if (phase === 'ANIMATION' && animState) {
      // Play impact sound (Net or Post) shortly after kick starts (0.6s animation)
      const impactTimeout = setTimeout(() => {
        if (animState.isGoal) {
            audioManager.play('post'); // Ball hits net sound
            setShakeNet(true); // Trigger visual net shake
        } else {
            // Miss/Defense
            if (animState.ballZone !== 'OUT') audioManager.play('miss'); 
        }
      }, 500); // 500ms -> Impact happens just before animation ends (600ms)

      // Celebration or Miss reaction after impact
      const resultTimeout = setTimeout(() => {
        console.log(`MatchScreen: Result Sound Trigger. IsGoal: ${animState.isGoal}`);
        if (animState.isGoal) {
             audioManager.play('goal');
        } else {
             audioManager.play('miss'); 
        }
        setShakeNet(false); // Reset net shake
      }, 700); 
      
      return () => {
          clearTimeout(impactTimeout);
          clearTimeout(resultTimeout);
      };
    }
  }, [phase, animState]);

  // Lógica da CPU
  useEffect(() => {
    if (!hasStarted) return;

    // 1. Pular telas de privacidade se for a vez da CPU
    if (phase === 'PRIVACY_A' && currentAttacker.id === 'cpu') {
      const t = setTimeout(() => setPhase('PICK_A'), 1500);
      return () => clearTimeout(t);
    }
    if (phase === 'PRIVACY_D' && currentDefender.id === 'cpu') {
      const t = setTimeout(() => setPhase('PICK_D'), 1500);
      return () => clearTimeout(t);
    }

    // 2. CPU Atacando (Escolhe onde chutar)
    if (phase === 'PICK_A' && currentAttacker.id === 'cpu') {
      const t = setTimeout(() => {
        if (phase === 'PICK_A') {
            const randomZone = ZONES[Math.floor(Math.random() * ZONES.length)].id;
            setAttackerPick(randomZone);
            setPhase('PRIVACY_D');
        }
      }, 1500);
      return () => clearTimeout(t);
    }

    // 3. CPU Defendendo (Escolhe onde defender e resolve o turno)
    if (phase === 'PICK_D' && currentDefender.id === 'cpu') {
      const t = setTimeout(() => {
        if (phase === 'PICK_D') {
            const randomZone = ZONES[Math.floor(Math.random() * ZONES.length)].id;
            const defPick = randomZone;
            
            const isGoal = attackerPick !== 'OUT' && attackerPick !== defPick;
            setAnimState({ ballZone: attackerPick, gkZone: defPick, isGoal });
            
            // Whistle and Kick logic before animation
            audioManager.play('whistle');
            setTimeout(() => {
                audioManager.play('kick');
                // Pequeno delay visual para sincronizar com o áudio (compensar latência/silêncio)
                setTimeout(() => setPhase('ANIMATION'), 100);
            }, 800); // 800ms delay for whistle before kick animation

            setTimeout(() => {
              resolveTurn(attackerPick, defPick, isGoal);
            }, 3000); // Increased delay to ensure animation/sound finishes (was 1800ms)
        }
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [phase, currentAttacker, currentDefender, attackerPick, hasStarted]);

  // Timer logic
  useEffect(() => {
    // Timer só roda se NÃO for vez da CPU jogar
    const isCpuPlaying = (phase === 'PICK_A' && currentAttacker.id === 'cpu') || (phase === 'PICK_D' && currentDefender.id === 'cpu');

    if (!hasStarted || phase === 'ANIMATION' || phase === 'RESOLUTION' || phase.startsWith('PRIVACY') || isCpuPlaying) {
       setTimer(15); // Reseta ou mantém cheio durante vez da CPU
       return;
    }
    
    if (timer <= 0) {
      handleTimeout();
      return;
    }

    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, phase, hasStarted, currentAttacker, currentDefender]);

  useEffect(() => {
    // Only run this ONCE when component mounts
    let isMounted = true;
    
    // StrictMode guard: se já inicializou nesta instância de ref, ignora.
    if (hasInitialized.current) return; 

    if (!hasStarted) {
       hasInitialized.current = true; // Marca como inicializado

       if (soundEnabled) {
          // Force ambience play on start
          audioManager.play('ambience');
       }

       if (!isTraining && isMounted) {
          // Debita a aposta (Stake) APENAS UMA VEZ no início
          // Verifica ledger para robustez extra (caso navegue e volte e o ref resete)
          const alreadyDeducted = ledger.some(l => l.meta?.matchId === matchId && l.type === 'match_entry');
          
          if (!alreadyDeducted) {
             transact(p1.id, 'match_entry', 0, -stake, { 
                matchId, 
                desc: 'Aposta da Partida' 
             });
          } else {
             console.log("MatchScreen: Aposta já debitada para matchId", matchId);
          }
       }
       setHasStarted(true);
       setPhase('PRIVACY_A');
    }

    return () => { isMounted = false; };
  }, []); // Empty dependency array ensures it runs only ONCE on mount

  const handleTimeout = () => {
    audioManager.play('whistle'); // Apito de tempo esgotado
    
    // Se o tempo acabar:
    // - Se for Atacante (PICK_A): Chuta pra fora (miss) e PERDE A VEZ (pula defesa)
    // - Se for Defensor (PICK_D): Goleiro fica parado (centro)
    
    if (phase === 'PICK_A') {
       // Chute pra fora (MISS)
       const missZone = 'OUT'; 
       const defPick = 'C'; // Defensor nem jogou, fica no centro
       const isGoal = false;

       setAttackerPick(missZone);
       
       // PULA a vez do defensor (PRIVACY_D/PICK_D) e vai direto para animação/resolução
       setAnimState({ ballZone: missZone, gkZone: defPick, isGoal });
       setPhase('ANIMATION');
       
       setTimeout(() => {
         resolveTurn(missZone, defPick, isGoal);
       }, 1000);

    } else if (phase === 'PICK_D') {
       const defPick = 'C'; // Goleiro parado
       const isGoal = attackerPick !== 'OUT' && attackerPick !== defPick;
       // Se o chute foi pra fora (OUT), isGoal = false.
       
       setAnimState({ ballZone: attackerPick, gkZone: defPick, isGoal });
       setPhase('ANIMATION');
       
       setTimeout(() => {
         resolveTurn(attackerPick, defPick, isGoal);
       }, 1000);
    }
  };

  const handleConfirm = () => {
    const finalZone = selectedZone || ZONES[Math.floor(Math.random() * ZONES.length)].id;
    
    if (phase === 'PICK_A') {
      setAttackerPick(finalZone);
      setSelectedZone(null);
      setPhase('PRIVACY_D');
    } else if (phase === 'PICK_D') {
      const defPick = finalZone;
      setSelectedZone(null);
      
      const isGoal = attackerPick !== defPick;
      
      setAnimState({ ballZone: attackerPick, gkZone: defPick, isGoal });
      
      // Whistle sequence
      audioManager.play('whistle');
      setTimeout(() => {
          audioManager.play('kick');
          // Pequeno delay visual para sincronizar com o áudio
          setTimeout(() => setPhase('ANIMATION'), 100);
      }, 800);
      
      setTimeout(() => {
        resolveTurn(attackerPick, defPick, isGoal);
      }, 3000); // Increased delay to ensure animation/sound finishes (was 1800ms)
    }
  };

  const resolveTurn = (attPick, defPick, isGoal) => {
    let newScore = { ...score };
    if (attPick === 'OUT') {
      isGoal = false; // Garante que chute pra fora nunca é gol
    } else {
      if (isGoal) {
        if (isP1Attacking) newScore.p1 += 1;
        else newScore.p2 += 1;
      }
    }
    
    setScore(newScore);
    const newLogs = [...logs, { turn, attacker: currentAttacker.username, attPick, defPick, isGoal }];
    setLogs(newLogs);
    setPhase('RESOLUTION'); 
    setTimer(15); // Reset timer
    
    setTimeout(() => {
      const p1Kicks = newLogs.filter(l => l.attacker === p1.username);
      const p2Kicks = newLogs.filter(l => l.attacker === p2.username);
      const p1Remaining = Math.max(0, 5 - p1Kicks.length);
      const p2Remaining = Math.max(0, 5 - p2Kicks.length);
      
      let matchEnded = false;

      if (p1Kicks.length <= 5 && p2Kicks.length <= 5) {
        if (newScore.p1 > newScore.p2 + p2Remaining) matchEnded = true; 
        if (newScore.p2 > newScore.p1 + p1Remaining) matchEnded = true; 
        if (p1Kicks.length === 5 && p2Kicks.length === 5 && newScore.p1 !== newScore.p2) matchEnded = true;
      } else {
        if (p1Kicks.length === p2Kicks.length && newScore.p1 !== newScore.p2) matchEnded = true;
      }

      if (matchEnded) {
        finishMatch(newScore, newLogs);
      } else {
        setTurn(t => t + 1);
        setPhase('PRIVACY_A');
        setAnimState(null);
        setAttackerPick(null);
      }
    }, 2000);
  };

  const finishMatch = (finalScore, finalLogs) => {
    const winner = finalScore.p1 > finalScore.p2 ? p1 : p2;
    const isDraw = finalScore.p1 === finalScore.p2;
    const sysFee = stake * 0.20; 
    const winnerGain = stake * 1.80; 

    if (!isTraining) {
      if (!isDraw) {
        if (winner.id === p1.id) {
           transact(p1.id, 'match_payout', 0, winnerGain, { matchResult: 'win', unlockAmount: stake });
        } else {
           transact(p1.id, 'match_result', 0, 0, { matchResult: 'loss', unlockAmount: stake });
        }
        setBank(prev => ({ ...prev, systemMPH: prev.systemMPH + sysFee }));
      } else {
        transact(p1.id, 'match_refund', 0, stake, { matchResult: 'draw', unlockAmount: stake });
      }
    }

    const matchData = { 
      id: matchId, // Usa o mesmo ID da transação
      p1: p1.id, p1Username: p1.username, 
      p2: p2.id, p2Username: p2.username, 
      stake, finalScore, winnerId: isDraw ? null : winner.id, logs: finalLogs, ts: Date.now(),
      isTraining
    };
    setMatches([matchData, ...matches]);
    navigate('/result', { matchData });
  };

  const handleEmote = (emoji) => {
      setPlayerEmote(emoji);
      setActiveModal(null);
      audioManager.play('selection');
      setTimeout(() => setPlayerEmote(null), 3000);
  };

  const p1Kicks = logs.filter(l => l.attacker === p1.username);
  const p2Kicks = logs.filter(l => l.attacker === p2.username);

  const isCpuTurn = (phase === 'PICK_A' && currentAttacker.id === 'cpu') || 
                    (phase === 'PICK_D' && currentDefender.id === 'cpu');

  if (phase === 'START') {
    return (
      <div className="absolute inset-0 z-50 bg-[#0d1322] flex flex-col items-center justify-center text-white px-6 text-center">
        <MascotAvatar mascotId={p2.mascotId} size="lg" />
        <h1 className="text-3xl font-black uppercase mt-6 animate-pulse text-yellow-400">
          VS {p2.username}
        </h1>
        <p className="text-gray-400 font-bold mt-2 uppercase text-sm tracking-widest">Prepare-se!</p>
      </div>
    );
  }

  if (phase === 'PICK_A' || phase === 'PICK_D') {
    // Show Timer
    return (
      <div className="absolute inset-0 z-50 bg-[#0d1322] flex flex-col overflow-hidden text-white font-sans">
        <div className="absolute top-36 left-1/2 -translate-x-1/2 z-50">
          <div className={`w-16 h-16 rounded-full border-4 ${timer <= 5 ? 'border-red-500 bg-red-900 animate-pulse' : 'border-white bg-black/50'} flex items-center justify-center`}>
            <span className={`text-2xl font-black ${timer <= 5 ? 'text-red-400' : 'text-white'}`}>{timer}</span>
          </div>
        </div>
        
        {/* ... Rest of the UI ... */}
        <div className="mt-4 mx-4 bg-[#1a1f2e]/90 backdrop-blur-md rounded-xl p-3 flex justify-between items-center border border-gray-700/50 shadow-2xl z-40 relative">
          <div className="flex flex-col items-center w-1/3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{p1.username.substring(0,8)}</span>
            <span className="text-3xl font-black text-yellow-500 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{score.p1}</span>
            <ScoreDots kicks={p1Kicks} />
          </div>
          <div className="flex flex-col items-center w-1/3 border-x border-gray-600/30">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rodada</span>
            <span className="text-2xl font-black text-white leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{turn > 10 ? 'MS' : `${Math.ceil(turn/2)}/6`}</span>
          </div>
          <div className="flex flex-col items-center w-1/3">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">{p2.username.substring(0,8)}</span>
            <span className="text-3xl font-black text-red-500 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{score.p2}</span>
            <ScoreDots kicks={p2Kicks} />
          </div>
        </div>

        <div className="flex-1 relative flex flex-col items-center justify-center w-full bg-[#0d1322] overflow-hidden">
           {/* Background Video Layer */}
           <div className="absolute top-0 inset-x-0 h-full z-0">
              <img 
                src="/assets/videos/loop_v1/loop_v1.gif"
                alt="Stadium Background"
                className="w-full h-full object-cover opacity-60"
                 style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent 90%)' }}
               />
               {/* Overlay Gradient for integration */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#0d1322]/80 via-transparent to-[#0d1322] mix-blend-multiply"></div>
           </div>
           
           {/* Grass Field with Advanced Perspective */}
           <div className="absolute bottom-0 w-full h-[48%] bg-[#1a472a] flex flex-col z-0 perspective-[800px] overflow-hidden">
              {/* Field Texture and Stripes */}
              <div className="absolute inset-0 w-full h-[200%]" style={{
                backgroundImage: `
                  repeating-linear-gradient(0deg, #15803d 0px, #15803d 40px, #166534 40px, #166534 80px),
                  radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1) 0%, transparent 60%)
                `,
                transform: 'rotateX(50deg) scale(2.5) translateY(-15%)',
                transformOrigin: 'bottom',
                boxShadow: 'inset 0 0 150px rgba(0,0,0,0.8)'
              }}></div>
              
              {/* Penalty Box Lines (Visual only) */}
              <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-white/30 blur-[1px]" style={{ transform: 'scaleX(1.5)' }}></div>
              <div className="absolute bottom-[20%] left-[20%] w-[1px] h-[100px] bg-white/30 blur-[1px] -rotate-[30deg] origin-bottom"></div>
              <div className="absolute bottom-[20%] right-[20%] w-[1px] h-[100px] bg-white/30 blur-[1px] rotate-[30deg] origin-bottom"></div>
           </div>
  
           <div className="relative w-full max-w-[380px] aspect-[16/10] z-10 mb-10 px-2">
              {/* Goal Structure (Net & Borders) */}
              <div className="absolute inset-0 mx-4 border-t-[14px] border-x-[14px] border-gray-200 bg-[#1c2230]/30 shadow-[0_30px_60px_rgba(0,0,0,0.9)] overflow-hidden rounded-t-xl ring-1 ring-gray-400/30">
                 {/* Realistic Net Pattern with Shake Animation */}
                 <div className={`absolute inset-0 w-full h-full ${shakeNet ? 'animate-net-shake' : ''} origin-top`}>
                    <svg width="100%" height="100%" className="absolute inset-0 opacity-40">
                      <defs>
                        <pattern id="net" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                          <rect width="100%" height="100%" fill="none" />
                          <path d="M0 0 L16 16 M16 0 L0 16" stroke="white" strokeWidth="0.8" fill="none" />
                        </pattern>
                        <radialGradient id="netShade" cx="50%" cy="100%" r="80%">
                          <stop offset="0%" stopColor="black" stopOpacity="0" />
                          <stop offset="100%" stopColor="black" stopOpacity="0.6" />
                        </radialGradient>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#net)" />
                      <rect width="100%" height="100%" fill="url(#netShade)" />
                    </svg>
                 </div>
                 {/* Goal Posts Shine/Highlight */}
                 <div className="absolute top-0 inset-x-0 h-[2px] bg-white/60 blur-[1px]"></div>
                 <div className="absolute left-0 inset-y-0 w-[2px] bg-white/40 blur-[1px]"></div>
                 <div className="absolute right-0 inset-y-0 w-[2px] bg-white/40 blur-[1px]"></div>
              </div>
  
              {/* Interactive Layer (Goalkeeper & Targets) */}
              <div className="absolute inset-0 mx-4 z-20">
                 {phase.startsWith('PICK') && ZONES.map(z => (
                   <button 
                     key={z.id}
                     onClick={() => {
                         if (!isCpuTurn) {
                             setSelectedZone(z.id);
                             audioManager.play('selection');
                         }
                     }}
                     disabled={isCpuTurn}
                     className={`absolute w-[56px] h-[56px] -ml-[28px] -mt-[28px] rounded-full flex items-center justify-center transition-all z-30 ${selectedZone === z.id ? 'scale-110 shadow-[0_0_20px_rgba(59,130,246,0.8)]' : (isCpuTurn ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105')}`}
                     style={{ top: z.top, left: z.left }}
                   >
                     <div className={`w-full h-full rounded-full border-[3px] ${selectedZone === z.id ? 'bg-blue-500/40 border-blue-400' : 'bg-blue-900/40 border-blue-600/50'} backdrop-blur-sm flex items-center justify-center shadow-inner`}>
                        <div className="text-2xl drop-shadow-md grayscale opacity-90">⚽</div>
                     </div>
                   </button>
                 ))}
                 <Goalkeeper 
                   diveZone={animState?.gkZone} 
                   mascotId={currentDefender.mascotId}
                   isAway={defenderIsAway}
                 />
              </div>
              <AnimatedBall targetZoneId={animState?.ballZone} />
              
              {isCpuTurn && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-4 py-2 rounded-full border border-yellow-500/50 z-40">
                  <span className="text-yellow-400 font-black text-xs uppercase animate-pulse">CPU Decidindo...</span>
                </div>
              )}
           </div>
        </div>
  
        {/* Bottom Control Bar */}
        <div className="h-24 bg-[#0b101b] flex items-center justify-between px-8 border-t border-[#1e293b] pb-safe relative z-30">
          {/* Left: Chat Button */}
          <div className="flex flex-col items-center gap-1 relative">
            <button 
                onClick={() => setActiveModal(activeModal === 'emotes' ? null : 'emotes')}
                className="w-12 h-12 rounded-full bg-[#1e293b] border border-[#334155] flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
               <MessageCircle size={24} className="text-blue-400" />
            </button>
            <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">Chat</span>
            
            {/* Player Emote Bubble Display */}
            {playerEmote && (
                <div className="absolute bottom-16 left-0 animate-bounce bg-white rounded-xl p-2 border-2 border-black shadow-lg z-50 whitespace-nowrap">
                    <span className="text-3xl">{playerEmote}</span>
                    <div className="absolute -bottom-2 left-4 w-3 h-3 bg-white border-b-2 border-r-2 border-black transform rotate-45"></div>
                </div>
            )}
          </div>
  
          {/* Center: Kick Button */}
          <div className="absolute left-1/2 -top-6 -translate-x-1/2 flex flex-col items-center">
            <button 
              onClick={handleConfirm}
              disabled={!phase.startsWith('PICK') || isCpuTurn}
              className={`w-32 h-32 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer`}
              style={{ background: 'transparent', border: 'none', padding: 0 }}
            >
              <img 
                src={kickBtnImg} 
                alt="Kick" 
                className={`w-full h-full object-contain drop-shadow-2xl ${(!phase.startsWith('PICK') || isCpuTurn) ? 'opacity-50 grayscale' : ''}`}
              />
            </button>
          </div>
  
          {/* Right: Team Info Button */}
          <div className="flex flex-col items-center gap-1">
            <button 
                onClick={() => setActiveModal(activeModal === 'team' ? null : 'team')}
                className="w-12 h-12 rounded-full bg-[#1e293b] border border-[#334155] flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
               <Info size={24} className="text-yellow-400" />
            </button>
            <span className="text-[9px] font-bold text-yellow-500 tracking-widest uppercase">Time</span>
          </div>
        </div>

        {/* Modals Overlay */}
        {activeModal && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center pb-28 animate-fade-in" onClick={() => setActiveModal(null)}>
                <div className="bg-white rounded-2xl p-4 w-[90%] max-w-sm border-4 border-black shadow-2xl relative" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setActiveModal(null)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 border-2 border-black">
                        <X size={16} />
                    </button>
                    
                    {activeModal === 'emotes' && (
                        <div className="grid grid-cols-4 gap-4">
                            {['👍', '😂', '😡', '👏', '⚽', '🔥', '🤔', '😭'].map(emoji => (
                                <button key={emoji} onClick={() => handleEmote(emoji)} className="text-4xl hover:scale-125 transition-transform p-2 bg-gray-100 rounded-lg border-2 border-gray-200">
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}

                    {activeModal === 'team' && (
                        <div className="text-center">
                            <h3 className="font-black text-xl uppercase mb-2 text-gray-800">Seu Time</h3>
                            <div className="flex justify-center mb-4">
                                <MascotAvatar mascotId={p1.mascotId} size="lg" />
                            </div>
                            <div className="bg-gray-100 p-3 rounded-xl border-2 border-gray-300">
                                <p className="font-black text-lg text-black">{MASCOTS.find(m => m.id === p1.mascotId)?.countryName}</p>
                                <p className="text-sm font-bold text-gray-500">{MASCOTS.find(m => m.id === p1.mascotId)?.mascotName}</p>
                                <div className="mt-2 text-xs text-gray-400 font-bold uppercase">
                                    (Alteração permitida apenas no Lobby)
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    );
  }

  // Rest of render logic for privacy screens etc.
  if (phase === 'PRIVACY_A' || phase === 'PRIVACY_D') {
    const playerToPlay = phase === 'PRIVACY_A' ? currentAttacker : currentDefender;
    const role = phase === 'PRIVACY_A' ? 'CHUTAR' : 'DEFENDER';
    const accentColor = phase === 'PRIVACY_A' ? 'text-green-400' : 'text-blue-400';
    const borderColor = phase === 'PRIVACY_A' ? 'border-green-500' : 'border-blue-500';

    if (playerToPlay.id === 'cpu') {
       return (
         <div className="absolute inset-0 z-50 bg-[#0f172a] flex flex-col items-center justify-center p-6 text-white text-center">
           <MascotAvatar mascotId={playerToPlay.mascotId} size="lg" />
           <h1 className="text-3xl font-black uppercase mt-6 animate-pulse text-yellow-400">
             CPU está se preparando...
           </h1>
           <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">Aguarde o oponente</p>
         </div>
       );
    }

    const isCpuMatch = p2.id === 'cpu';
    const privacyTitle = isCpuMatch ? 'Prepare-se!' : 'Passe o dispositivo';

    return (
      <div className="absolute inset-0 z-50 bg-[#0f172a] flex flex-col items-center justify-center p-6 text-white text-center">
        <ShieldCheck size={80} className={`${accentColor} mb-6 animate-pulse`} />
        <h1 className="text-3xl font-black uppercase mb-4 text-gray-300">{privacyTitle}</h1>
        <div className={`flex flex-col items-center gap-4 bg-[#1e293b] p-8 rounded-3xl border-2 ${borderColor} mb-8 shadow-2xl`}>
          <MascotAvatar mascotId={playerToPlay.mascotId} size="lg" />
          <span className={`text-4xl font-black ${accentColor}`}>{playerToPlay.username}</span>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 bg-black/50 px-4 py-1 rounded-full">Sua vez de {role}</span>
        </div>
        <Button onClick={() => setPhase(phase === 'PRIVACY_A' ? 'PICK_A' : 'PICK_D')} className="w-full max-w-sm text-xl py-5 bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          ESTOU PRONTO
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-[#0d1322] flex flex-col overflow-hidden text-white font-sans">
      <div className="mt-4 mx-4 bg-[#1a1f2e]/90 backdrop-blur-md rounded-xl p-3 flex justify-between items-center border border-gray-700/50 shadow-2xl z-40 relative">
          <div className="flex flex-col items-center w-1/3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{p1.username.substring(0,8)}</span>
            <span className="text-3xl font-black text-yellow-500 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{score.p1}</span>
            <ScoreDots kicks={p1Kicks} />
          </div>
          <div className="flex flex-col items-center w-1/3 border-x border-gray-600/30">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rodada</span>
            <span className="text-2xl font-black text-white leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{turn > 10 ? 'MS' : `${Math.ceil(turn/2)}/6`}</span>
          </div>
          <div className="flex flex-col items-center w-1/3">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">{p2.username.substring(0,8)}</span>
            <span className="text-3xl font-black text-red-500 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{score.p2}</span>
            <ScoreDots kicks={p2Kicks} />
          </div>
        </div>

      <div className="flex-1 relative flex flex-col items-center justify-center w-full bg-[#0d1322] overflow-hidden">
         {/* Background Video Layer */}
         <div className="absolute top-0 inset-x-0 h-full z-0">
            <img 
              src="/assets/videos/loop_v1/loop_v1.gif"
              alt="Stadium Background"
              className="w-full h-full object-cover opacity-60"
              style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent 90%)' }}
            />
            {/* Overlay Gradient for integration */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0d1322]/80 via-transparent to-[#0d1322] mix-blend-multiply"></div>
         </div>

         {/* Grass Field with Advanced Perspective */}
         <div className="absolute bottom-0 w-full h-[60%] bg-[#1a472a] flex flex-col z-0 perspective-[800px] overflow-hidden">
            {/* Field Texture and Stripes */}
            <div className="absolute inset-0 w-full h-[200%]" style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, #15803d 0px, #15803d 40px, #166534 40px, #166534 80px),
                radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1) 0%, transparent 60%)
              `,
              transform: 'rotateX(50deg) scale(2.5) translateY(-15%)',
              transformOrigin: 'bottom',
              boxShadow: 'inset 0 0 150px rgba(0,0,0,0.8)'
            }}></div>
            
            {/* Penalty Box Lines (Visual only) */}
            <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-white/30 blur-[1px]" style={{ transform: 'scaleX(1.5)' }}></div>
            <div className="absolute bottom-[20%] left-[20%] w-[1px] h-[100px] bg-white/30 blur-[1px] -rotate-[30deg] origin-bottom"></div>
            <div className="absolute bottom-[20%] right-[20%] w-[1px] h-[100px] bg-white/30 blur-[1px] rotate-[30deg] origin-bottom"></div>
         </div>

         <div className="relative w-full max-w-[380px] aspect-[16/10] z-10 mb-24 px-2">
            {/* Goal Structure (Net & Borders) */}
            <div className="absolute inset-0 mx-4 border-t-[14px] border-x-[14px] border-gray-200 bg-[#1c2230]/30 shadow-[0_30px_60px_rgba(0,0,0,0.9)] overflow-hidden rounded-t-xl ring-1 ring-gray-400/30">
               {/* Realistic Net Pattern */}
               <svg width="100%" height="100%" className="absolute inset-0 opacity-40">
                 <defs>
                   <pattern id="net" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                     <rect width="100%" height="100%" fill="none" />
                     <path d="M0 0 L16 16 M16 0 L0 16" stroke="white" strokeWidth="0.8" fill="none" />
                   </pattern>
                   <radialGradient id="netShade" cx="50%" cy="100%" r="80%">
                     <stop offset="0%" stopColor="black" stopOpacity="0" />
                     <stop offset="100%" stopColor="black" stopOpacity="0.6" />
                   </radialGradient>
                 </defs>
                 <rect width="100%" height="100%" fill="url(#net)" />
                 <rect width="100%" height="100%" fill="url(#netShade)" />
               </svg>
               {/* Goal Posts Shine/Highlight */}
               <div className="absolute top-0 inset-x-0 h-[2px] bg-white/60 blur-[1px]"></div>
               <div className="absolute left-0 inset-y-0 w-[2px] bg-white/40 blur-[1px]"></div>
               <div className="absolute right-0 inset-y-0 w-[2px] bg-white/40 blur-[1px]"></div>
            </div>

            {/* Interactive Layer (Goalkeeper & Targets) */}
            <div className="absolute inset-0 mx-4 z-20">
               {phase.startsWith('PICK') && ZONES.map(z => (
                 <button 
                   key={z.id}
                   onClick={() => !isCpuTurn && setSelectedZone(z.id)}
                   disabled={isCpuTurn}
                   className={`absolute w-[56px] h-[56px] -ml-[28px] -mt-[28px] rounded-full flex items-center justify-center transition-all z-30 ${selectedZone === z.id ? 'scale-110 shadow-[0_0_20px_rgba(59,130,246,0.8)]' : (isCpuTurn ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105')}`}
                   style={{ top: z.top, left: z.left }}
                 >
                   <div className={`w-full h-full rounded-full border-[3px] ${selectedZone === z.id ? 'bg-blue-500/40 border-blue-400' : 'bg-blue-900/40 border-blue-600/50'} backdrop-blur-sm flex items-center justify-center shadow-inner`}>
                      <img src={ballImg} alt="Target" className="w-6 h-6 object-contain opacity-90 drop-shadow-md grayscale" />
                   </div>
                 </button>
               ))}
               <Goalkeeper 
                 diveZone={animState?.gkZone} 
                 mascotId={currentDefender.mascotId}
                 isAway={defenderIsAway}
               />
            </div>
            <AnimatedBall targetZoneId={animState?.ballZone} />
            
            {isCpuTurn && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-4 py-2 rounded-full border border-yellow-500/50 z-40">
                <span className="text-yellow-400 font-black text-xs uppercase animate-pulse">CPU Decidindo...</span>
              </div>
            )}
         </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="h-24 bg-[#0b101b] flex items-center justify-between px-8 border-t border-[#1e293b] pb-safe relative z-30">
        {/* Left: Chat Button */}
        <div className="flex flex-col items-center gap-1 relative">
          <button 
              onClick={() => setActiveModal(activeModal === 'emotes' ? null : 'emotes')}
              className="w-12 h-12 rounded-full bg-[#1e293b] border border-[#334155] flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
             <MessageCircle size={24} className="text-blue-400" />
          </button>
          <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">Chat</span>
          
          {/* Player Emote Bubble Display */}
          {playerEmote && (
              <div className="absolute bottom-16 left-0 animate-bounce bg-white rounded-xl p-2 border-2 border-black shadow-lg z-50 whitespace-nowrap">
                  <span className="text-3xl">{playerEmote}</span>
                  <div className="absolute -bottom-2 left-4 w-3 h-3 bg-white border-b-2 border-r-2 border-black transform rotate-45"></div>
              </div>
          )}
        </div>

        {/* Center: Kick Button */}
          <div className="absolute left-1/2 -top-8 -translate-x-1/2 flex flex-col items-center z-50">
            <button 
              onClick={handleConfirm}
              disabled={!phase.startsWith('PICK') || isCpuTurn}
              className={`w-32 h-32 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer`}
              style={{ background: 'transparent', border: 'none', padding: 0 }}
            >
              <img 
                src={kickBtnImg} 
                alt="Kick" 
                className={`w-full h-full object-contain drop-shadow-2xl ${(!phase.startsWith('PICK') || isCpuTurn) ? 'opacity-50 grayscale' : ''}`}
              />
            </button>
          </div>

        {/* Right: Team Info Button */}
        <div className="flex flex-col items-center gap-1">
          <button 
              onClick={() => setActiveModal(activeModal === 'team' ? null : 'team')}
              className="w-12 h-12 rounded-full bg-[#1e293b] border border-[#334155] flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
             <Info size={24} className="text-yellow-400" />
          </button>
          <span className="text-[9px] font-bold text-yellow-500 tracking-widest uppercase">Time</span>
        </div>
      </div>

      {/* Modals Overlay */}
      {activeModal && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center pb-28 animate-fade-in" onClick={() => setActiveModal(null)}>
              <div className="bg-white rounded-2xl p-4 w-[90%] max-w-sm border-4 border-black shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setActiveModal(null)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 border-2 border-black">
                      <X size={16} />
                  </button>
                  
                  {activeModal === 'emotes' && (
                      <div className="grid grid-cols-4 gap-4">
                          {['👍', '😂', '😡', '👏', '⚽', '🔥', '🤔', '😭'].map(emoji => (
                              <button key={emoji} onClick={() => handleEmote(emoji)} className="text-4xl hover:scale-125 transition-transform p-2 bg-gray-100 rounded-lg border-2 border-gray-200">
                                  {emoji}
                              </button>
                          ))}
                      </div>
                  )}

                  {activeModal === 'team' && (
                      <div className="text-center">
                          <h3 className="font-black text-xl uppercase mb-2 text-gray-800">Seu Time</h3>
                          <div className="flex justify-center mb-4">
                              <MascotAvatar mascotId={p1.mascotId} size="lg" />
                          </div>
                          <div className="bg-gray-100 p-3 rounded-xl border-2 border-gray-300">
                              <p className="font-black text-lg">{MASCOTS.find(m => m.id === p1.mascotId)?.countryName}</p>
                              <p className="text-sm font-bold text-gray-500">{MASCOTS.find(m => m.id === p1.mascotId)?.mascotName}</p>
                              <div className="mt-2 text-xs text-gray-400 font-bold uppercase">
                                  (Alteração permitida apenas no Lobby)
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}

      {phase === 'RESOLUTION' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <h1 className={`text-6xl font-black italic uppercase drop-shadow-[4px_4px_0_rgba(0,0,0,1)] ${animState?.isGoal ? 'text-green-400 animate-bounce' : 'text-red-500 animate-pulse'} `} style={{ textShadow: '0 0 50px currentColor' }}>
            {animState?.isGoal ? 'GOOOL!' : 'DEFESA!'}
          </h1>
        </div>
      )}
    </div>
  );
};
