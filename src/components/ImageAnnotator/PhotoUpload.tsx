import { useRef, useState } from 'react';

interface Props {
  onPhotoLoaded: (dataUrl: string, nativeW: number, nativeH: number) => void;
}

// Reads a File as a data URL and resolves its native pixel dimensions.
function readImageFile(file: File): Promise<{ dataUrl: string; w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => resolve({ dataUrl, w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = reject;
      img.src = dataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Drop-zone and file-picker for the space photo.
export function PhotoUpload({ onPhotoLoaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WebP…)');
      return;
    }
    try {
      const { dataUrl, w, h } = await readImageFile(file);
      onPhotoLoaded(dataUrl, w, h);
    } catch {
      setError('Could not read the image. Please try another file.');
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Space photo</h3>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`w-full rounded-xl border-2 border-dashed py-8 px-4 flex flex-col items-center gap-2 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
          isDragging
            ? 'border-amber-400 bg-amber-500/5'
            : 'border-slate-700 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50'
        }`}
      >
        <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-sm text-slate-400">
          {isDragging ? 'Drop to upload' : 'Upload space photo'}
        </span>
        <span className="text-xs text-slate-600">Click or drag &amp; drop — JPG, PNG, WebP</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}
