import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Button } from '../components/ui/Base';
import { MascotAvatar } from '../components/ui/MascotAvatar';
import { MessageSquare } from 'lucide-react';

export const ForumScreen = () => {
  const { posts, setPosts, currentUser, users } = useContext(AppContext);
  const [msg, setMsg] = useState('');

  const sendMsg = () => {
    if(!msg.trim()) return;
    const newPost = { id: Date.now(), authorId: currentUser.id, content: msg, ts: Date.now() };
    setPosts([newPost, ...posts]);
    setMsg('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] pb-4">
      <Card className="flex-1 overflow-y-auto mb-4 space-y-4 bg-blue-50">
        {posts.length === 0 && <p className="text-center font-bold text-gray-400 mt-10">Fórum vazio. Seja o primeiro a provocar!</p>}
        {posts.map(p => {
          const author = users.find(u => u.id === p.authorId);
          const isMe = p.authorId === currentUser.id;
          return (
            <div key={p.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-3 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${isMe ? 'bg-yellow-400 rounded-br-none' : 'bg-white rounded-bl-none'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <MascotAvatar mascotId={author?.mascotId} size="sm" />
                  <span className="font-black text-xs uppercase">{author?.username}</span>
                </div>
                <p className="font-bold text-sm">{p.content}</p>
              </div>
            </div>
          );
        })}
      </Card>
      <div className="flex gap-2">
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==='Enter' && sendMsg()} className="flex-1 border-4 border-black rounded-xl p-3 font-bold" placeholder="Digite sua mensagem..." />
        <Button onClick={sendMsg}><MessageSquare size={24} fill="currentColor"/></Button>
      </div>
    </div>
  );
};
