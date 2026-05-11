import React, { useState } from 'react';
import axios from 'axios';
import { Shield, ShieldAlert, Loader2, Info, Star, ShieldBan } from 'lucide-react';
import Swal from 'sweetalert2';

export const DiscordBadgeTool: React.FC = () => {
    const [token, setToken] = useState('');
    const [houseId, setHouseId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // House Options
    const houses = [
      { id: 1, name: 'Bravery', color: 'bg-[#9b59b6]', hover: 'hover:bg-[#8e44ad]', icon: 'https://cdn.discordapp.com/emojis/1414550425000218704.png' },
      { id: 2, name: 'Brilliance', color: 'bg-[#e67e22]', hover: 'hover:bg-[#d35400]', icon: 'https://cdn.discordapp.com/emojis/1414550460647342161.png' },
      { id: 3, name: 'Balance', color: 'bg-[#2ecc71]', hover: 'hover:bg-[#27ae60]', icon: 'https://cdn.discordapp.com/emojis/1414550486480060516.png' },
    ];

    const handleSetBadge = async () => {
        if (!token) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing User Token',
                background: '#0B0F14',
                color: '#fff'
            });
            return;
        }
        if (!houseId) {
            Swal.fire({
                icon: 'warning',
                title: 'Please Select a House',
                background: '#0B0F14',
                color: '#fff'
            });
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.post('/api/discord/hypesquad', { token, house_id: houseId });
            if (res.data.success) {
                Swal.fire({
                   icon: 'success',
                   title: 'Badge Acquired!',
                   text: 'Congratulations! You received the HypeSquad badge.',
                   background: '#0B0F14',
                   color: '#fff'
                });
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error Occurred',
                text: error.response?.data?.error || "Unable to process. Please check your Token.",
                background: '#0B0F14',
                color: '#fff'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveBadge = async () => {
        if (!token) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing User Token',
                background: '#0B0F14',
                color: '#fff'
            });
            return;
        }

        const confirm = await Swal.fire({
            title: 'Confirm Badge Removal',
            text: "Do you want to remove the HypeSquad badge from your account?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ED4245',
            cancelButtonColor: '#2b2d31',
            confirmButtonText: 'Remove Badge',
            cancelButtonText: 'Cancel',
            background: '#0B0F14',
            color: '#fff'
        });

        if (confirm.isConfirmed) {
            setIsLoading(true);
            try {
                // To safely pass data in DELETE request with Axios
                const res = await axios.delete('/api/discord/hypesquad', { data: { token } });
                if (res.data.success) {
                    Swal.fire({
                       icon: 'success',
                       title: 'Badge Removed!',
                       background: '#0B0F14',
                       color: '#fff'
                    });
                }
            } catch (error: any) {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: error.response?.data?.error || "ไม่สามารถดำเนินการได้ โปรดตรวจสอบ Token ของคุณ",
                    background: '#0B0F14',
                    color: '#fff'
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 mt-4 md:mt-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5865F2]/10 text-[#5865F2] text-xs font-bold mb-4 border border-[#5865F2]/20 backdrop-blur-sm">
                     <Star className="w-4 h-4" /> DISCORD TOOL
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-white flex items-center gap-4 tracking-tight drop-shadow-lg">
                     Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-[#5865F2]">HypeSquad</span> Badge
                  </h2>
                  <p className="text-zinc-400 mt-4 text-base leading-relaxed max-w-2xl font-medium">
                     Select the House you want. Receive a free HypeSquad badge for your profile easily with no cost!
                  </p>
                </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex gap-4 text-orange-400 text-sm">
                <Info className="w-6 h-6 shrink-0" />
                <div>
                   <p className="font-bold mb-1">Security Warning!</p>
                   <p className="opacity-90 leading-relaxed">
                       Our system doesn't store your User Token in the database. You can always invalidate your token by changing your password. Use an alt account for maximum safety.
                   </p>
                </div>
            </div>

            <div className="bg-[#0B0F14]/90 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#5865F2]/80 to-transparent"></div>
                
                <div className="space-y-8 relative z-10">
                    <div>
                        <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest pl-4 mb-2 block">1. Select House</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {houses.map((house) => (
                                <button
                                    key={house.id}
                                    onClick={() => setHouseId(house.id)}
                                    className={`
                                        flex items-center justify-center gap-3 py-5 px-4 rounded-2xl border-2 transition-all duration-300
                                        ${houseId === house.id 
                                            ? `bg-white/5 border-[${house.color.split('bg-[')[1].split(']')[0]}] text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-105` 
                                            : 'bg-black/40 border-white/5 text-zinc-400 hover:bg-white/5 hover:border-white/10'
                                        }
                                    `}
                                    style={houseId === house.id ? { 
                                        borderColor: house.color.split('bg-[')[1]?.split(']')[0],
                                        boxShadow: `0 0 15px ${house.color.split('bg-[')[1]?.split(']')[0]}30`
                                    } : {}}
                                >
                                    <img src={house.icon} alt={house.name} className={`w-8 h-8 ${houseId === house.id ? 'drop-shadow-lg' : ''}`} />
                                    <span className="font-bold tracking-wide">House of {house.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest pl-4 mb-2 block text-[#5865F2]">2. Enter User Token</label>
                        <input 
                            type="text" 
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="MTAz..." 
                            className="w-full bg-[#05070A] border border-white/5 rounded-2xl px-6 py-4 text-white text-sm font-medium placeholder-zinc-700 outline-none focus:border-[#5865F2]/40 focus:ring-4 focus:ring-[#5865F2]/10 transition-all font-mono shadow-inner"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button 
                            onClick={handleSetBadge} 
                            disabled={isLoading}
                            className="flex-1 relative group overflow-hidden rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#5865F2] to-indigo-600 transition-transform duration-300 group-hover:scale-[1.02]"></div>
                            <div className="relative w-full flex items-center justify-center gap-2 py-4 text-white font-bold text-sm shadow-[0_0_20px_rgba(88,101,242,0.3)] group-hover:shadow-[0_0_25px_rgba(88,101,242,0.4)] transition-all">
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Shield className="w-5 h-5" /> Claim HypeSquad Badge</>}
                            </div>
                        </button>
                        
                        <button 
                            onClick={handleRemoveBadge}
                            disabled={isLoading}
                            className="sm:w-auto w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 py-4 px-8 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldBan className="w-5 h-5" /> Remove Badge</>}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 text-center text-sm text-zinc-500">
               <p>© apex systems</p>
            </div>
        </div>
    );
};
