import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, FileText } from 'lucide-react';
import Markdown from 'react-markdown';

interface PageViewProps {
  page: { title: string; content: string; slug: string } | null;
  onBack: () => void;
}

export const PageView: React.FC<PageViewProps> = ({ page, onBack }) => {
  if (!page) return null;

  return (
    <div className="w-full animate-in fade-in duration-500 max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-2 mb-8 text-sm">
        <button onClick={onBack} className="text-muted-foreground hover:text-white transition-colors flex items-center gap-1 font-bold">
          <ArrowLeft className="w-4 h-4" />
          กลับหน้าหลัก
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border  overflow-hidden p-8 md:p-12 min-h-[60vh] "
      >
        <h1 className="text-3xl md:text-4xl font-semibold text-white mb-8 border-b border-border  pb-6 flex items-center gap-3">
           <FileText className="w-8 h-8 text-[#10b981] hidden sm:block" />
           {page.title.replace(/^#+\s*/, '')}
        </h1>
        
        <div className="prose prose-zinc max-w-none prose-headings:font-semibold prose-a:text-[#10b981] hover:prose-a:text-[#1D4ED8]">
           <div className="markdown-body">
             <Markdown>{page.content || '*ไม่มีเนื้อหา*'}</Markdown>
           </div>
        </div>
      </motion.div>
    </div>
  );
};
