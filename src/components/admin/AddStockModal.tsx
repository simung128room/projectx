import React, { useState, useRef, useEffect } from 'react';
import { Layers, X, Database, Upload, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import { Product } from '../../types';

export const AddStockModal = ({ 
  product, 
  onAppendStock, 
  onClose 
}: { 
  product: Product, 
  onAppendStock: (newItems: string[]) => void, 
  onClose: () => void 
}) => {
  const [linesPerStock, setLinesPerStock] = useState(1);
  const [fileStockPreview, setFileStockPreview] = useState<string[]>([]);
  const [singleFilesPreview, setSingleFilesPreview] = useState<{name: string, b64: string}[]>([]);
  const [mode, setMode] = useState<'text'|'file'|'single-file'>('text');
  const [stockCount, setStockCount] = useState(0);
  const [isBigTextMode, setIsBigTextMode] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const singleFileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const largeTextRef = useRef<string>("");
  const [uploadProgress, setUploadProgress] = useState(-1);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress(0);
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentLoaded = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentLoaded);
      }
    };

    reader.onload = (event) => {
      setUploadProgress(100);
      setTimeout(() => {
        const text = event.target?.result as string;
        if (text) {
          largeTextRef.current = text;
          // Optimizing counting further
          let newlines = 0;
          for (let i = 0; i < text.length; i++) {
            if (text[i] === '\n') newlines++;
          }
          const linesCount = newlines + 1;
          setFileStockPreview(new Array(linesCount)); // Just to keep math accurate
          setIsBigTextMode(true);
        }
        setUploadProgress(-1);
      }, 50);
    };
    reader.readAsText(file);
  };

  const handleSingleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    
    const maxFileSize = 5 * 1024 * 1024;
    const rejectedFiles: string[] = [];

    Array.from(fileList).forEach((file: File) => {
      if (file.size > maxFileSize) {
        rejectedFiles.push(file.name);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const b64 = event.target?.result as string;
        if (b64) {
          setSingleFilesPreview(prev => [...prev, {name: file.name, b64}]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (rejectedFiles.length > 0) {
      if (rejectedFiles.length === 1) {
        Swal.fire({title: 'ไฟล์ใหญ่เกินไป', text: `ไฟล์ ${rejectedFiles[0]} มีขนาดใหญ่กว่า 5MB. ให้ใช้วิธีอัพโหลดไฟล์แล้ววางลิงก์แทน`, icon: 'error', background: '#121212', color: '#fff'});
      } else {
        Swal.fire({title: 'พบไฟล์ใหญ่เกิน 5MB', text: `มี ${rejectedFiles.length} ไฟล์ที่มีขนาดใหญ่กว่า 5MB เช่น ${rejectedFiles[0]} ระบบจึงต้องข้ามไฟล์เหล่านี้ไป`, icon: 'warning', background: '#121212', color: '#fff'});
      }
    }
  };

  const updateTextCount = () => {
    if (isBigTextMode) {
       const val = largeTextRef.current;
       if (!val) { setStockCount(0); return; }
       
       // Use fast V8-optimized built-ins for counting newlines without regex
       let matches = val.split('\n').length - 1;
       setStockCount(Math.ceil((matches + 1) / linesPerStock));
       return;
    }
    
    if (!textRef.current) return;
    const val = textRef.current.value;
    if (!val.trim()) {
      setStockCount(0);
      return;
    }
    let matches = val.match(/\n/g);
    let rawLines = matches ? matches.length + 1 : 1;
    setStockCount(Math.ceil(rawLines / linesPerStock));
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text');
    if (text.length > 100000) {
      e.preventDefault();
      largeTextRef.current = text;
      setIsBigTextMode(true);
      if (textRef.current) {
         textRef.current.value = "=== พบข้อมูลขนาดใหญ่มาก (โหมด Big Data) ===\n\nระบบซ่อนตัวอย่างเพื่อความลื่นไหล รองรับแล้ว 3,000,000+ บรรทัด\n\n(หากต้องการแก้ไขกรุณากดปุ่มล้างข้อมูลด้านล่าง)";
      }
      setTimeout(updateTextCount, 0);
    }
  };

  const resetBigData = () => {
     largeTextRef.current = "";
     setIsBigTextMode(false);
     if (textRef.current) textRef.current.value = "";
     setStockCount(0);
     setFileStockPreview([]);
  };

  useEffect(() => {
    updateTextCount();
  }, [linesPerStock, isBigTextMode]);

  const handleSaveStock = () => {
    let newItems: string[] = [];
    const sourceText = isBigTextMode ? largeTextRef.current : (textRef.current?.value || "");
    
    if (mode === 'text' || mode === 'file') {
      if (!sourceText.trim() && fileStockPreview.length === 0) return;
      
      let lines: string[] = [];
      const splitLines = sourceText.split('\n');
      for (let i = 0; i < splitLines.length; i++) {
         const t = splitLines[i].trim();
         if (t.length > 0) lines.push(t);
      }

      if (linesPerStock > 1) {
        for (let i = 0; i < lines.length; i += linesPerStock) {
          const chunk = lines.slice(i, i + linesPerStock).join('\n');
          newItems.push(chunk);
        }
      } else {
        newItems = lines;
      }
    } else if (mode === 'single-file' && singleFilesPreview.length > 0) {
      newItems = singleFilesPreview.map(f => JSON.stringify({ type: 'file', name: f.name, data: f.b64 }));
    }

    if (newItems.length === 0) {
      return Swal.fire({title: 'ข้อมูลว่างเปล่า', text: 'ไม่ได้เพิ่มสต๊อกใหม่', icon: 'error', background: '#121212', color: '#fff'});
    }

    if (newItems.length > 500) {
      Swal.fire({
        title: 'กำลังประมวลผล',
        text: `กำลังเตรียมบันทึกสต๊อก ${newItems.length.toLocaleString()} รายการ โปรดรอสักครู่และห้ามปิดหน้าต่างนี้...`,
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        background: '#121212', color: '#fff'
      });
    }

    onAppendStock(newItems);
  };

  return (
    <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-3xl saturate-150 flex items-center justify-end p-0 z-50">
      <div className="bg-[#121212] border-l border-[#374151] border w-full max-w-md h-full relative p-6 sm:p-8 overflow-y-auto animate-in slide-in-from-right-full duration-300">
        <h2 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
          <Database className="w-5 h-5 text-[#364153]" />
          เพิ่มสต๊อก: {product.name}
        </h2>
        
        <div className="flex bg-[#121212] p-1 mb-6">
          <button 
            onClick={() => setMode('file')}
            className={`flex-1 py-2 text-xs font-medium transition-all ${mode === 'file' ? 'bg-[#121212] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            ไฟล์ .txt (หลายสต๊อก)
          </button>
          <button 
            onClick={() => setMode('single-file')}
            className={`flex-1 py-2 text-xs font-medium transition-all ${mode === 'single-file' ? 'bg-[#121212] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            ไฟล์ทั่วไป (1 ไฟล์ = 1 สต๊อก)
          </button>
          <button 
            onClick={() => setMode('text')}
            className={`flex-1 py-2 text-xs font-medium transition-all ${mode === 'text' ? 'bg-[#121212] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            วางข้อความ
          </button>
        </div>

        {mode === 'file' && (
          <div className="space-y-4">
            <div 
              onClick={() => fileRef.current?.click()}
              className="border border-dashed border-[#374151] hover:border-emerald-500/50 bg-[#121212] p-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 text-[#364153] mb-3" />
              <p className="text-sm font-medium text-zinc-400">คลิกเพื่ออัพโหลดไฟล์ .txt</p>
              <p className="text-xs text-zinc-400 mt-1">1 บรรทัด = 1 สต๊อก</p>
              <input 
                type="file" 
                accept=".txt" 
                className="hidden" 
                ref={fileRef}
                onChange={handleFileUpload}
              />
            </div>

            {uploadProgress >= 0 && (
              <div className="bg-[#121212] border border-[#374151] border p-4 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-zinc-400">กำลังประมวลผลไฟล์...</span>
                  <span className="text-xs font-medium text-[#364153]">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-[#121212] h-1.5 object-cover overflow-hidden">
                  <div className="bg-[#364153] h-1.5 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between bg-[#121212] p-3 border border-[#374151] border">
              <label className="text-sm font-medium text-zinc-400">จำนวนบรรทัดต่อ 1 สต๊อก</label>
              <input 
                type="number" 
                min="1" 
                value={linesPerStock} 
                onChange={(e) => setLinesPerStock(Math.max(1, parseInt(e.target.value) || 1))} 
                className="w-20 bg-[#121212] border border-[#374151] px-3 py-1 text-white text-center font-medium"
              />
            </div>

            {fileStockPreview.length > 0 && (
              <div className="bg-[#364153]/10 border border-emerald-500/20 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#364153]" />
                  <div>
                    <p className="text-sm font-medium text-[#364153]">พบข้อมูลสต๊อก</p>
                    <p className="text-xs text-[#364153]/80">พร้อมเพิ่ม {Math.ceil(fileStockPreview.length / linesPerStock)} รายการ (จาก {fileStockPreview.length} บรรทัด)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'single-file' && (
          <div className="space-y-4">
            <div 
              onClick={() => singleFileRef.current?.click()}
              className="border border-dashed border-[#374151] hover:border-emerald-500/50 bg-[#121212] p-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 text-[#364153] mb-3" />
              <p className="text-sm font-medium text-zinc-400">อัพโหลดไฟล์สินค้า</p>
              <p className="text-xs text-zinc-400 mt-1">สูงสุด 5MB ต่อไฟล์ (เลือกหลายไฟล์ได้)</p>
              <input 
                type="file" 
                multiple
                className="hidden" 
                ref={singleFileRef}
                onChange={handleSingleFileUpload}
              />
            </div>
            {singleFilesPreview.length > 0 && (
              <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                {singleFilesPreview.map((f, i) => (
                  <div key={i} className="bg-[#121212] border border-[#374151] border p-2.5 flex items-center justify-between">
                    <span className="text-xs font-medium truncate max-w-[200px] text-zinc-400">{f.name}</span>
                    <span className="text-[10px] text-[#364153] font-medium bg-[#364153] text-black px-2 py-0.5 rounded">Ready</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {mode === 'text' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#121212] p-3 border border-[#374151] border">
              <label className="text-sm font-medium text-zinc-400">จำนวนบรรทัดต่อ 1 สต๊อก</label>
              <input 
                type="number" 
                min="1" 
                value={linesPerStock} 
                onChange={(e) => setLinesPerStock(Math.max(1, parseInt(e.target.value) || 1))} 
                className="w-20 bg-[#121212] border border-[#374151] px-3 py-1 text-white text-center font-medium"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-zinc-400">วางข้อมูลสต๊อก</label>
                <div className="flex items-center gap-2">
                  {isBigTextMode && (
                    <button onClick={resetBigData} className="text-[10px] bg-red-500/20 text-red-400 hover:bg-red-500/30 px-2 py-0.5 rounded font-medium transition-colors">
                      ล้างข้อมูล (Clear)
                    </button>
                  )}
                  <span className="text-[10px] text-zinc-400 bg-[#121212] px-2 py-0.5 rounded">
                    คำนวณได้: {stockCount} สต๊อก
                  </span>
                </div>
              </div>
              <textarea 
                ref={textRef}
                onChange={updateTextCount}
                onPaste={handlePaste}
                disabled={isBigTextMode}
                className="w-full bg-[#121212] border border-[#374151] border p-4 text-white focus:outline-none focus:border-emerald-500 text-sm h-40 resize-none font-mono text-xs leading-relaxed disabled:opacity-50"
                placeholder="ข้อมูลบรรทัดที่ 1&#10;ข้อมูลบรรทัดที่ 2&#10;ข้อมูลบรรทัดที่ 3&#10;..."
              />
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-[#121212] hover:bg-[#1e1e1e] text-white text-sm font-medium transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            onClick={handleSaveStock}
            className="flex-1 px-4 py-3 bg-[#364153] hover:bg-[#364153] text-white text-sm font-medium transition-colors"
          >
            เพิ่มสต๊อกเข้าสู่ระบบ
          </button>
        </div>
      </div>
    </div>
  );
};
