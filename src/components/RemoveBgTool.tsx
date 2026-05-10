import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Download, Loader2 } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';
import Swal from 'sweetalert2';

export const RemoveBgTool = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBg = async () => {
    if (!selectedImage) return;

    try {
      setIsProcessing(true);
      const imageBlob = await fetch(selectedImage).then(r => r.blob());
      
      const config = {
        progress: (key: string, current: number, total: number) => {
          console.log(`Downloading model... ${key}: ${current}/${total}`);
        }
      };

      const resultBlob = await removeBackground(imageBlob, config);
      const resultUrl = URL.createObjectURL(resultBlob);
      
      setResultImage(resultUrl);
    } catch (error: any) {
      console.error(error);
      Swal.fire('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถลบพื้นหลังได้', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = 'output_image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-3">
          <ImageIcon className="w-8 h-8 text-fuchsia-500" />
          ระบบเครื่องมือตัดพื้นหลังรูปภาพ (Remove BG)
        </h2>
        <p className="text-zinc-400">อัพโหลดรูปภาพของท่านเพื่อลบพื้นหลังออกอัตโนมัติด้วย AI</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8">
        {!selectedImage ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 hover:border-fuchsia-500 rounded-2xl p-12 text-center cursor-pointer transition-colors"
          >
            <Upload className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">คลิกเพื่ออัพโหลดรูปภาพ</h3>
            <p className="text-sm text-zinc-500">รองรับไฟล์ JPG, PNG</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="font-bold text-zinc-400 text-center">รูปภาพต้นฉบับ</p>
                <div className="bg-zinc-950 rounded-2xl overflow-hidden aspect-square border border-zinc-800 flex items-center justify-center">
                  <img src={selectedImage} alt="Original" className="max-w-full max-h-full object-contain" />
                </div>
                <button 
                  onClick={() => { setSelectedImage(null); setResultImage(null); }}
                  className="w-full py-2 text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  เลือกรุปใหม่
                </button>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-zinc-400 text-center">รูปภาพผลลัพธ์</p>
                <div className="bg-zinc-950 rounded-2xl overflow-hidden aspect-square border border-zinc-800 flex items-center justify-center relative bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYNgfQEhgYGD4z8DAwMgAF+NYwACxAaMNGAqA0QYMNWC0AUMBsB8QCAgAz0Yw7y95wDkAAAAASUVORK5CYII=')]">
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-10">
                      <Loader2 className="w-10 h-10 text-fuchsia-500 animate-spin mb-4" />
                      <p className="text-white font-bold animate-pulse">กำลังประมวลผล AI... (อาจใช้เวลา 1-2 นาทีในครั้งแรก)</p>
                    </div>
                  )}
                  {resultImage && (
                    <img src={resultImage} alt="Result" className="max-w-full max-h-full object-contain relative z-20" />
                  )}
                  {!resultImage && !isProcessing && (
                    <div className="text-zinc-600 text-sm">ยังไม่มีผลลัพธ์</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              {!resultImage && !isProcessing && (
                <button 
                  onClick={handleRemoveBg}
                  className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
                >
                  <ImageIcon className="w-5 h-5" /> ลบพื้นหลังเลย!
                </button>
              )}
              
              {resultImage && (
                <button 
                  onClick={downloadImage}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
                >
                  <Download className="w-5 h-5" /> ดาวน์โหลดรููปภาพ
                </button>
              )}
            </div>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageChange} 
          accept="image/*" 
          className="hidden" 
        />
      </div>
    </div>
  );
};
