import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Button } from '../components/ui/Base';
import { Settings, Trash2, Globe, Headset, Check, Copy } from 'lucide-react';

export const SettingsScreen = () => {
  const { navigate, soundEnabled, setSoundEnabled, privacyScreenEnabled, setPrivacyScreenEnabled } = useContext(AppContext);

  const handleReset = () => {
    if (window.confirm("ATENÇÃO: Isso apagará TODAS as contas, saldos e histórico de partidas deste dispositivo. Deseja continuar?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center gap-3 bg-white p-3 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] mb-6">
        <Settings size={28} className="text-gray-600" />
        <h1 className="font-black text-xl uppercase">Configurações</h1>
      </div>

      <Card className="space-y-4">
        <h2 className="font-black text-lg uppercase border-b-4 border-black pb-2 text-gray-700">Preferências</h2>
        <div 
          onClick={() => setPrivacyScreenEnabled(!privacyScreenEnabled)}
          className="flex justify-between items-center p-2 bg-gray-100 rounded-xl border-2 border-black cursor-pointer active:scale-95 transition-transform"
        >
          <span className="font-bold uppercase text-sm">Tela de Privacidade (Turnos)</span>
          <div className={`w-12 h-6 rounded-full border-2 border-black relative transition-colors ${privacyScreenEnabled ? 'bg-green-400' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full border-2 border-black transition-all ${privacyScreenEnabled ? 'right-1' : 'left-1'}`}></div>
          </div>
        </div>
        <div 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex justify-between items-center p-2 bg-gray-100 rounded-xl border-2 border-black cursor-pointer active:scale-95 transition-transform"
        >
          <span className="font-bold uppercase text-sm">Efeitos Sonoros</span>
          <div className={`w-12 h-6 rounded-full border-2 border-black relative transition-colors ${soundEnabled ? 'bg-green-400' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full border-2 border-black transition-all ${soundEnabled ? 'right-1' : 'left-1'}`}></div>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 border-red-500 bg-red-50">
        <h2 className="font-black text-lg uppercase border-b-4 border-red-500 pb-2 text-red-600">Zona de Perigo</h2>
        <p className="text-xs font-bold text-red-500">Isso irá formatar o seu MVP e apagar o banco de dados local.</p>
        <Button variant="danger" className="w-full flex items-center justify-center gap-2" onClick={handleReset}>
          <Trash2 size={20} /> RESETAR TODOS OS DADOS
        </Button>
      </Card>
    </div>
  );
};

export const SupportScreen = () => {
  const [copied, setCopied] = useState(false);
  const supportMsg = "Olá Suporte! Preciso de ajuda com minha conta no PenaltyPay$. Meu ID de usuário é: ";

  const handleCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = supportMsg;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center gap-3 bg-white p-3 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] mb-6">
        <Headset size={28} className="text-blue-600" />
        <h1 className="font-black text-xl uppercase">Suporte</h1>
      </div>

      <Card className="space-y-4 bg-blue-50">
        <h2 className="font-black text-lg uppercase border-b-4 border-blue-300 pb-2">Grupo Principal</h2>
        <p className="font-bold text-sm text-gray-600">Copie a mensagem padrão abaixo e envie no nosso grupo oficial do Telegram/WhatsApp para atendimento rápido.</p>
        <div className="bg-white p-3 rounded-xl border-2 border-black font-bold text-sm text-gray-500 relative">
          "{supportMsg} [SEU ID]"
        </div>
        <Button variant="action" className="w-full flex items-center justify-center gap-2" onClick={handleCopy}>
          {copied ? <Check size={20} /> : <Copy size={20} />} 
          {copied ? 'COPIADO!' : 'COPIAR MENSAGEM'}
        </Button>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-black text-lg uppercase border-b-4 border-black pb-2">FAQ Rápido</h2>
        <div className="space-y-2">
          <div className="bg-gray-100 p-3 rounded-xl border-2 border-black">
            <p className="font-black text-sm uppercase">Como funciona o saque?</p>
            <p className="font-bold text-xs text-gray-600 mt-1">O saque mínimo é de $20 com uma taxa de 2%. Você precisa converter suas MPH para USD na Wallet primeiro.</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-xl border-2 border-black">
            <p className="font-black text-sm uppercase">O que é a Morte Súbita?</p>
            <p className="font-bold text-xs text-gray-600 mt-1">Se o jogo empatar após 5 chutes de cada lado, inicia-se a morte súbita: quem errar e o outro acertar, perde a aposta.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export const LanguagesScreen = () => {
  const [lang, setLang] = useState('pt');

  const languages = [
    { id: 'pt', name: 'Português (BR)', emoji: '🇧🇷' },
    { id: 'en', name: 'English (US)', emoji: '🇺🇸' },
    { id: 'es', name: 'Español', emoji: '🇪🇸' },
  ];

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center gap-3 bg-white p-3 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] mb-6">
        <Globe size={28} className="text-green-600" />
        <h1 className="font-black text-xl uppercase">Idioma</h1>
      </div>

      <Card className="space-y-2">
        {languages.map(l => (
          <div 
            key={l.id} 
            onClick={() => setLang(l.id)}
            className={`flex items-center justify-between p-4 rounded-xl border-4 cursor-pointer transition-transform active:scale-95 ${lang === l.id ? 'border-yellow-400 bg-yellow-100' : 'border-black bg-white hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{l.emoji}</span>
              <span className="font-black uppercase">{l.name}</span>
            </div>
            {lang === l.id && <Check size={24} className="text-green-600" strokeWidth={4} />}
          </div>
        ))}
      </Card>
    </div>
  );
};
