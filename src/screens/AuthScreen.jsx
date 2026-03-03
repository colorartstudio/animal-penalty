import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Button } from '../components/ui/Base';
import { MASCOTS } from '../utils/constants';

export const AuthScreen = () => {
  const { registerUser, loginUser } = useContext(AppContext);
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState('');
  const [pin, setPin] = useState('');
  const [mascot, setMascot] = useState('br');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      if (!loginUser(user, pin)) setError('Usuário ou PIN incorretos!');
    } else {
      if (user.length < 3 || pin.length !== 4) setError('Username min 3 chars, PIN exatos 4 dígitos.');
      else registerUser(user, pin, mascot);
    }
  };

  return (
    <div className="min-h-screen bg-blue-300 flex items-center justify-center p-4 cartoon-bg">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black italic transform -skew-x-6 text-yellow-400 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
            ANIMAL PENALTY
          </h1>
          <p className="font-bold text-sm uppercase mt-2">Animal Edition</p>
        </div>
        {error && <div className="bg-red-400 border-2 border-black p-2 rounded-lg mb-4 text-center font-bold text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-black mb-1 uppercase text-sm">Username</label>
            <input value={user} onChange={e=>setUser(e.target.value)} className="w-full border-4 border-black rounded-xl p-3 font-bold" placeholder="Seu nick" />
          </div>
          <div>
            <label className="block font-black mb-1 uppercase text-sm">PIN (4 dígitos)</label>
            <input type="password" maxLength={4} value={pin} onChange={e=>setPin(e.target.value)} className="w-full border-4 border-black rounded-xl p-3 font-bold text-center tracking-[1em]" placeholder="****" />
          </div>
          {!isLogin && (
            <div>
              <label className="block font-black mb-2 uppercase text-sm">Escolha seu Mascote</label>
              <div className="grid grid-cols-4 gap-2">
                {MASCOTS.map(m => (
                  <div key={m.id} onClick={() => setMascot(m.id)} className={`cursor-pointer aspect-square rounded-xl border-4 ${mascot === m.id ? 'border-yellow-400 bg-yellow-100' : 'border-black bg-white'} p-1 flex items-center justify-center transition-transform hover:scale-105 overflow-hidden`}>
                    {m.icon ? (
                      <img src={m.icon} alt={m.mascotName} className="w-full h-full object-contain transform scale-125" />
                    ) : (
                      <span className="text-4xl">{m.emoji}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button className="w-full text-xl mt-4" variant="action">
            {isLogin ? 'ENTRAR NA ARENA' : 'CRIAR CONTA'}
          </Button>
        </form>
        <p className="text-center mt-6 font-bold cursor-pointer underline" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
          {isLogin ? 'Novo por aqui? Crie sua conta.' : 'Já tem conta? Faça login.'}
        </p>
      </Card>
    </div>
  );
};
