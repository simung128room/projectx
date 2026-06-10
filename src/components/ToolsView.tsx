import React, { useState } from 'react';
import { Bot, Send, MessageSquare, Terminal, ShieldCheck, Globe, Zap, ArrowRight, Star, ExternalLink, Search, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedScroll } from './AnimatedScroll';

interface ToolsViewProps {
  setActiveView: (view: any) => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({ setActiveView }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const tools = [
    {
      id: 'auto_deploy',
      name: '',
      desc: '  MySQL ',
      category: 'premium',
      icon: Globe,
      gradient: 'from-[#059669] to-[#10B981]',
      iconColor: 'text-[#10B981]',
      glowColor: 'group-hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]',
      tag: 'HOT',
      premium: false
    },
    {
      id: 'api_proxy_gen',
      name: 'API Proxy',
      desc: ' API  Proxy    0.1 ',
      category: 'utility',
      icon: Globe,
      gradient: 'from-[#8B5CF6] to-[#C084FC]',
      iconColor: 'text-[#C084FC]',
      glowColor: 'group-hover:shadow-[0_0_40px_-10px_rgba(192,132,252,0.4)]',
      tag: 'NEW',
      premium: false
    },
    {
      id: 'two_fa_generator',
      name: ' 2FA',
      desc: ' (OTP) ',
      category: 'utility',
      icon: Zap,
      gradient: 'from-[#10B981] to-[#34D399]',
      iconColor: 'text-[#10B981]',
      glowColor: 'group-hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]',
      premium: false
    },
    {
      id: 'proxy_free',
      name: '',
      desc: ' Proxy    ',
      category: 'utility',
      icon: Globe,
      gradient: 'from-[#06b6d4] to-[#22d3ee]',
      iconColor: 'text-[#06b6d4]',
      glowColor: 'group-hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.4)]',
      premium: false
    }
  ];

  const categories = [
    { id: 'all', label: '' },
    { id: 'utility', label: '' },
    { id: 'social', label: '' },
    { id: 'premium', label: '' },
  ];

  const filteredTools = tools.filter(tool => {
    const matchSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       tool.desc.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchCategory = true;
    if (activeCategory === 'premium') {
      matchCategory = tool.premium;
    } else if (activeCategory !== 'all') {
      matchCategory = tool.category === activeCategory;
    }

    return matchSearch && matchCategory;
  });

  return (<AnimatedScroll direction="up">
      <div className="font-sans px-4 pb-20 w-full max-w-7xl mx-auto mt-6 lg:mt-10">
        
        {/* Header Section: Hero Style */}
        <div className="relative mb-14 overflow-hidden bg-gradient-to-br from-[#0B0D11] to-[#12161D] border border-border border-2 p-8 md:p-12 lg:p-16 isolate">
          {/* Decorative Blooms */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary text-primary-foreground blur-[120px] pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] pointer-events-none -z-10 -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 z-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-card border border-border border-2 text-blue-400 text-xs font-black uppercase tracking-widest mb-6 backdrop-blur-sm brut-card">
                <Sparkles className="w-4 h-4 text-blue-400" /> APEX</div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
                <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500"></span>
              </h1>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
                </p>
            </div>

            <div className="w-full lg:w-80 space-y-4 shrink-0">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 backdrop-blur-sm backdrop-blur-md border border-border border-2 py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium placeholder:text-zinc-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters / Categories */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <div className="hidden md:flex items-center gap-2 mr-4 text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest"></span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 text-sm font-bold transition-all duration-300 ${ activeCategory === cat.id ? 'bg-purple-600 text-white border border-blue-500' : 'bg-[#121212] text-muted-foreground border-border border-2 hover:bg-[#121212] hover:text-white' }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tools Grid Area */}
        {filteredTools.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border bg-card brut-card"
          >
            <div className="w-20 h-20 bg-card flex items-center justify-center mb-6 brut-card">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2"></h3>
            <p className="text-muted-foreground text-sm"></p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredTools.map((tool, idx) => (
                <motion.div
                  layout
                  key={tool.id}
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.05, ease: [0.23, 1, 0.32, 1] }}
                  onClick={() => {
                    if ((tool as any).link) {
                      window.open((tool as any).link, '_blank');
                    } else {
                      setActiveView(tool.id);
                    }
                  }}
                  className={`group cursor-pointer bg-card border border-border border-2 hover:border-white/10 p-7 transition-all duration-500 relative overflow-hidden flex flex-col h-full ${tool.glowColor} hover:-translate-y-1.5 brut-card`}
                >
                  {/* Subtle Background Accent inside card */}
                  <div className={`absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-15 blur-[60px] transition-opacity duration-700 pointer-events-none`}></div>

                  {/* Header Row: Icon & Badges */}
                  <div className="flex justify-between items-start mb-6 relative z-10 w-full">
                    <div className={`w-14 h-14 bg-card border border-border border-2 flex items-center justify-center ${tool.iconColor} group-hover:scale-110 transition-transform duration-500 ease-out brut-card`}>
                      <tool.icon className="w-7 h-7" strokeWidth={1.5} />
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                       {tool.premium && (
                          <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 backdrop-blur-md">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-wider">VIP</span>
                          </div>
                       )}
                       {tool.tag && (
                          <div className={`px-3 py-1.5 backdrop-blur-md text-[10px] font-black uppercase tracking-wider ${ tool.tag === 'HOT' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : tool.tag === 'FREE' ? 'bg-blue-600/10 text-blue-600 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20' }`}>
                            {tool.tag}
                          </div>
                       )}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 flex flex-col relative z-10">
                    <h3 className="text-xl font-black text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 transition-all">
                      {tool.name}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-8 font-medium">
                      {tool.desc}
                    </p>

                    {/* Bottom Action */}
                    <div className="mt-auto flex items-center justify-between pt-5 border-t border-border border-2">
                       <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${tool.iconColor} opacity-70 group-hover:opacity-100 flex items-center gap-2`}>
                          </span>
                       <div className="w-10 h-10 bg-card flex items-center justify-center text-muted-foreground group-hover:text-white group-hover:bg-white/10 transition-all duration-300 shrink-0 brut-card">
                          {(tool as any).link ? (
                            <ExternalLink className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                          ) : (
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          )}
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Informational Footer */}
        <div className="mt-16 flex justify-center pb-8">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-5 bg-card border border-border border-2 backdrop-blur-sm brut-card">
               <div className="w-10 h-10 bg-amber-500/10 flex items-center justify-center shrink-0">
                 <ShieldCheck className="w-5 h-5 text-amber-500" /> 
               </div>
               <p className="text-muted-foreground text-sm text-center font-medium">
                 <span className="text-amber-500 font-black px-1">VIP</span> Premium</p>
            </div>
        </div>
      </div>
    </AnimatedScroll>
  );
};

