import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Hash, Volume2, ShieldAlert, Paperclip, Send, Plus, Users, Crown, Settings } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

interface CommunityViewProps {
  user: any;
  isAdmin: boolean;
  userRank: string;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ user, isAdmin, userRank }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLayout();
  }, []);

  const fetchLayout = async () => {
    try {
      const [catRes, chanRes] = await Promise.all([
        axios.get('/api/community/categories'),
        axios.get('/api/community/channels')
      ]);
      setCategories(catRes.data);
      setChannels(chanRes.data);
      if (chanRes.data.length > 0) {
        setActiveChannelId(chanRes.data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeChannelId) {
      fetchMessages(activeChannelId);
      // In real life we'd use WebSocket or long polling, but for this demo poll every 5s
      const interval = setInterval(() => {
        fetchMessages(activeChannelId);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeChannelId]);

  const fetchMessages = async (channelId: string) => {
    try {
      const res = await axios.get(`/api/community/messages/${channelId}`);
      setMessages(res.data);
      scrollToBottom();
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChannelId) return;
    
    if (!isAdmin) {
       Swal.fire('Error', 'เฉพาะแอดมินเท่านั้นที่สามารถส่งข้อความได้', 'error');
       return;
    }

    try {
      await axios.post(`/api/community/messages/${activeChannelId}`, {
        content: messageInput
      });
      setMessageInput('');
      fetchMessages(activeChannelId);
    } catch (e: any) {
      Swal.fire('Error', e.message || 'Failed to send message', 'error');
    }
  };

  const claimBasicRank = async () => {
    if (!user) {
      Swal.fire('Error', 'กรุณาเข้าสู่ระบบก่อน', 'error');
      return;
    }
    
    try {
      Swal.fire({ title: 'กำลังตรวจสอบ...', didOpen: () => Swal.showLoading(), background: '#09090b', color: '#fff' });
      await axios.post('/api/community/claim_basic_rank');
      Swal.fire('สำเร็จ!', 'คุณได้รับยศสมาชิกพื้นฐานแล้ว (รีเฟรชหน้าเว็บเพื่ออัปเดต)', 'success').then(() => {
         window.location.reload();
      });
    } catch (e: any) {
      Swal.fire('ล้มเหลว', e.response?.data?.error || 'ไม่สามารถรับยศได้', 'error');
    }
  };

  const activeChannel = channels.find(c => c.id === activeChannelId);

  return (
    <div className="flex h-[85vh] bg-[#09090b] text-white font-sans overflow-hidden border border-white/5 rounded-3xl shadow-2xl">
      {/* Sidebar - Categories & Channels */}
      <div className="w-64 bg-[#0e1116] border-r border-white/5 flex flex-col hidden md:flex shrink-0">
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/5 shadow-sm">
          <h2 className="font-black text-lg tracking-tight">Community</h2>
          {isAdmin && (
            <button onClick={() => {
              const name = prompt('Channel Name:');
              if (name) {
                axios.post('/api/community/channels', { name, categoryId: 'default', type: 'text', order: 0 }).then(() => fetchLayout());
              }
            }} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white">
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-none">
          {loading && <div className="text-center text-zinc-500 py-10">Loading...</div>}
          
          {categories.map(cat => (
            <div key={cat.id}>
              <div className="flex items-center text-zinc-400 hover:text-zinc-200 uppercase tracking-wider text-[11px] font-bold mb-1 px-1 cursor-pointer">
                <span className="truncate">{cat.name}</span>
              </div>
              
              <div className="space-y-0.5">
                {channels.filter(ch => ch.categoryId === cat.id).map(channel => (
                  <div 
                    key={channel.id}
                    onClick={() => setActiveChannelId(channel.id)}
                    className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                      activeChannelId === channel.id 
                        ? 'bg-white/10 text-white font-bold' 
                        : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200 font-medium'
                    }`}
                  >
                    {channel.type === 'role_claim' ? (
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                    ) : (
                      <Hash className="w-4 h-4 shrink-0" />
                    )}
                    <span className="truncate text-sm">{channel.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {categories.length === 0 && !loading && (
             <div className="text-center text-zinc-500 text-sm mt-10">
               ไม่มีช่องในขณะนี้
             </div>
          )}
        </div>
        
        {/* User Status Bar */}
        <div className="p-3 bg-[#0a0d12] border-t border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'guest'}&backgroundColor=1E90FF`} className="w-full h-full rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
             <p className="text-sm font-bold truncate text-white">{user?.email?.split('@')[0] || 'Guest'}</p>
             <p className={`text-[10px] font-bold uppercase tracking-widest ${userRank === 'premium' ? 'text-amber-500' : userRank === 'basic' ? 'text-emerald-500' : 'text-zinc-500'}`}>
                {userRank === 'premium' ? 'Premium' : userRank === 'basic' ? 'Basic' : 'ทั่วไป'}
             </p>
          </div>
        </div>
      </div>

      {/* Main Content - Chat Area */}
      <div className="flex-1 flex flex-col bg-[#09090b] min-w-0">
        {activeChannel ? (
          <>
            {/* Header */}
            <div className="h-16 px-6 border-b border-white/5 flex items-center shadow-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                {activeChannel.type === 'role_claim' ? <ShieldAlert className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
                <h3 className="font-bold text-lg text-white">{activeChannel.name}</h3>
              </div>
            </div>

            {/* Chat History or Role Claim */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {activeChannel.type === 'role_claim' ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                   <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                      <ShieldAlert className="w-10 h-10" />
                   </div>
                   <h2 className="text-2xl font-black mb-3 text-white">ช่องรับยศสมาชิก</h2>
                   <p className="text-zinc-400 mb-8 leading-relaxed text-sm">
                      กดปุ่มด้านล่างเพื่อรับยศ <b className="text-emerald-500">"สมาชิกพื้นฐาน"</b> เพื่อปลดล็อคสิทธิพิเศษต่างๆ ยกเว้นสิทธิพรีเมี่ยมที่คุณต้องใช้คีย์!
                   </p>
                   
                   <button 
                     onClick={claimBasicRank}
                     disabled={userRank === 'basic' || userRank === 'premium'}
                     className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl active:scale-95 transition-all flex justify-center items-center gap-2 shadow-lg shadow-emerald-900/20"
                   >
                      <Users className="w-5 h-5" />
                      {userRank === 'user' ? 'รับยศสมาชิกพื้นฐาน' : userRank === 'basic' ? 'คุณมียศนี้แล้ว' : 'คุณเป็นพรีเมี่ยมแล้ว!'}
                   </button>
                </div>
              ) : (
                <>
                  {messages.length === 0 ? (
                    <div className="flex flex-col flex-1 items-center justify-center h-full text-zinc-500 space-y-4 pt-20">
                      <Hash className="w-12 h-12 opacity-20" />
                      <p className="text-sm font-medium">นี่คือจุดเริ่มต้นของช่อง {activeChannel.name}</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={idx} 
                        className="flex gap-4 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0 mt-0.5 overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender}&backgroundColor=1E90FF`} className="w-full h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-bold text-white text-[15px]">{msg.sender}</span>
                            <span className="text-xs text-zinc-500 font-medium">
                              {new Date(msg.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          {msg.fileUrl && (
                             <div className="mt-3">
                               <img src={msg.fileUrl} alt="Attachment" className="max-w-[300px] h-auto rounded-lg border border-white/10" />
                             </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Box */}
            {activeChannel.type !== 'role_claim' && (isAdmin || userRank !== 'user') && (
              <div className="p-4 md:p-6 bg-[#09090b]">
                <form onSubmit={sendMessage} className="relative flex items-end gap-2">
                  <div className="flex-1 bg-[#2b2d31] border border-white/5 rounded-xl flex items-center px-4 py-3">
                     <button type="button" className="text-zinc-400 hover:text-white mr-3">
                       <Plus className="w-5 h-5" />
                     </button>
                     <input 
                       type="text" 
                       value={messageInput}
                       onChange={e => setMessageInput(e.target.value)}
                       disabled={!isAdmin}
                       placeholder={isAdmin ? `ส่งข้อความถึง #${activeChannel.name}` : `เฉพาะแอดมินเท่านั้นที่ส่งได้`}
                       className="flex-1 bg-transparent border-none outline-none text-zinc-200 placeholder:text-zinc-500"
                     />
                  </div>
                  {isAdmin && (
                    <button type="submit" className="w-12 h-12 bg-[#1E90FF] hover:bg-blue-500 text-white rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-lg">
                      <Send className="w-5 h-5 ml-1" />
                    </button>
                  )}
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-6 text-center">
            <Volume2 className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-white mb-2">ไม่พบช่อง</h3>
            <p>กรุณาเลือกช่องทางซ้าย หรือรอแอดมินเพิ่มช่อง</p>
          </div>
        )}
      </div>
    </div>
  );
};
