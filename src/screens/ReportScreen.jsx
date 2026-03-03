import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Button } from '../components/ui/Base';
import { formatUSD } from '../utils/formatters';
import { Download } from 'lucide-react';

export const ReportScreen = () => {
  const { ledger, matches, currentUser } = useContext(AppContext);
  const [tab, setTab] = useState('finance');

  const myLedger = ledger.filter(l => l.userId === currentUser.id);
  
  // Formatters
  const formatValue = (val, isUSD) => {
      if (val === 0) return '-';
      const sign = val > 0 ? '+' : '';
      if (isUSD) return `${sign}${formatUSD(val)}`;
      return `${sign}${val}`;
  };

  const myMatches = matches.filter(m => m.p1 === currentUser.id || m.p2 === currentUser.id);

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ finance: myLedger, matches: myMatches }));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `report_${currentUser.username}_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex justify-between items-center bg-white p-3 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <h1 className="font-black text-xl uppercase">Relatórios</h1>
        <Button variant="ghost" onClick={exportJSON} className="p-2 border-2"><Download size={20}/></Button>
      </div>

      <div className="flex bg-white rounded-xl border-4 border-black overflow-hidden mb-4">
        <button onClick={() => setTab('finance')} className={`flex-1 py-2 font-black uppercase text-xs ${tab === 'finance' ? 'bg-yellow-400 border-b-4 border-black' : 'bg-gray-100'}`}>Financeiro</button>
        <button onClick={() => setTab('matches')} className={`flex-1 py-2 font-black uppercase text-xs ${tab === 'matches' ? 'bg-yellow-400 border-b-4 border-black' : 'bg-gray-100'}`}>Partidas</button>
      </div>

      <Card className="overflow-x-auto p-0">
        {tab === 'finance' && (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-200 border-b-4 border-black uppercase font-black text-[10px]">
              <tr><th className="p-3">Data</th><th className="p-3">Evento</th><th className="p-3 text-right">USD</th><th className="p-3 text-right">MPH</th></tr>
            </thead>
            <tbody>
              {myLedger.length === 0 && <tr><td colSpan="4" className="p-4 text-center font-bold">Nenhum registro.</td></tr>}
              {myLedger.map(l => (
                <tr key={l.id} className="border-b-2 border-gray-100 font-bold">
                  <td className="p-3 text-gray-500 text-xs">{new Date(l.ts).toLocaleDateString()}</td>
                  <td className="p-3 text-xs">{l.type.replace(/_/g, ' ').toUpperCase()}</td>
                  <td className={`p-3 text-right text-xs ${l.deltaUSD > 0 ? 'text-green-600' : l.deltaUSD < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {l.deltaUSD !== 0 ? formatUSD(l.deltaUSD) : '-'}
                  </td>
                  <td className={`p-3 text-right text-xs ${l.deltaMPH > 0 ? 'text-green-600' : l.deltaMPH < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {l.deltaMPH !== 0 ? `${l.deltaMPH > 0 ? '+' : ''}${l.deltaMPH}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === 'matches' && (
          <div className="p-2 space-y-2">
            {myMatches.length === 0 && <p className="text-center font-bold p-4">Nenhuma partida.</p>}
            {myMatches.map(m => (
              <div key={m.id} className="border-2 border-black rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between font-black uppercase text-sm mb-2">
                  <span>Stake: {m.stake} MPH</span>
                  <span className={m.winnerId === currentUser.id ? 'text-green-600' : 'text-red-600'}>
                    {m.winnerId ? (m.winnerId === currentUser.id ? 'VENCEU' : 'PERDEU') : 'EMPATE'}
                  </span>
                </div>
                <div className="text-center text-2xl font-black bg-white border-2 border-black rounded py-2 mb-2">
                  {m.finalScore.p1} x {m.finalScore.p2}
                </div>
                <p className="text-xs text-gray-500 font-bold text-center">ID: {m.id} • {new Date(m.ts).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
