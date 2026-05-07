import { useRef, useEffect, useState, useCallback } from 'react';
import type { AnnotationState, Stroke, Point } from '../../types';

type AnnotationMode = 'brush' | 'line';
type BrushSize = 'small' | 'medium' | 'large';

// Reference brush sizes at 600px canvas width. Scaled proportionally at render time.
const BRUSH_SIZES: Record<BrushSize, number> = { small: 8, medium: 18, large: 30 };
const HANDLE_RADIUS = 12;

interface Props {
  photoDataUrl: string;
  nativeW: number;
  nativeH: number;
  annotations: AnnotationState;
  onChange: (a: AnnotationState) => void;
}

// Draws all brush strokes to an offscreen canvas at full opacity, then composites
// the result onto the target canvas at 40% global alpha. This ensures overlapping
// strokes don't compound their opacity — the whole mask appears as one flat layer.
function redrawBrushCanvas(
  canvas: HTMLCanvasElement,
  strokes: Stroke[],
  inProgress?: { points: Point[]; brushSize: number; isEraser: boolean }
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const all: Stroke[] = inProgress && inProgress.points.length >= 2
    ? [...strokes, inProgress]
    : [...strokes];

  if (all.length === 0) return;

  // Draw all strokes at full opacity into an offscreen canvas
  const off = document.createElement('canvas');
  off.width = canvas.width;
  off.height = canvas.height;
  const offCtx = off.getContext('2d');
  if (!offCtx) return;

  for (const stroke of all) {
    if (stroke.points.length < 2) continue;
    offCtx.save();
    offCtx.lineWidth = stroke.brushSize * (canvas.width / 600);
    offCtx.lineCap = 'round';
    offCtx.lineJoin = 'round';

    if (stroke.isEraser) {
      offCtx.globalCompositeOperation = 'destination-out';
      offCtx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      offCtx.globalCompositeOperation = 'source-over';
      offCtx.strokeStyle = 'rgb(59,130,246)';
    }

    offCtx.beginPath();
    offCtx.moveTo(stroke.points[0].x * canvas.width, stroke.points[0].y * canvas.height);
    for (let i = 1; i < stroke.points.length; i++) {
      offCtx.lineTo(stroke.points[i].x * canvas.width, stroke.points[i].y * canvas.height);
    }
    offCtx.stroke();
    offCtx.restore();
  }

  // Composite the offscreen layer onto the display canvas at 40% opacity
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.drawImage(off, 0, 0);
  ctx.restore();
}

// Draws the placement line and its two draggable circular endpoint handles.
function redrawLineCanvas(canvas: HTMLCanvasElement, line: AnnotationState['placementLine']) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!line) return;

  const sx = line.start.x * canvas.width;
  const sy = line.start.y * canvas.height;
  const ex = line.end.x * canvas.width;
  const ey = line.end.y * canvas.height;

  ctx.save();
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  for (const [px, py] of [[sx, sy], [ex, ey]] as [number, number][]) {
    ctx.beginPath();
    ctx.arc(px, py, HANDLE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

// Determines whether a canvas-space point falls within a handle hit target.
function hitHandle(
  pt: Point,
  line: AnnotationState['placementLine'],
  canvasW: number,
  canvasH: number
): 'start' | 'end' | null {
  if (!line) return null;
  const px = pt.x * canvasW;
  const py = pt.y * canvasH;
  const dist = (h: Point) =>
    Math.sqrt((px - h.x * canvasW) ** 2 + (py - h.y * canvasH) ** 2);
  if (dist(line.start) <= HANDLE_RADIUS + 6) return 'start';
  if (dist(line.end) <= HANDLE_RADIUS + 6) return 'end';
  return null;
}

// Converts a mouse or touch event position to normalised (0–1) canvas coordinates.
function toNorm(clientX: number, clientY: number, canvas: HTMLCanvasElement): Point {
  const r = canvas.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(1, (clientX - r.left) / r.width)),
    y: Math.max(0, Math.min(1, (clientY - r.top) / r.height)),
  };
}

export function ImageAnnotator({ photoDataUrl, nativeW, nativeH, annotations, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const brushCanvasRef = useRef<HTMLCanvasElement>(null);
  const lineCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [mode, setMode] = useState<AnnotationMode>('brush');
  const [brushSize, setBrushSize] = useState<BrushSize>('medium');
  const [isEraser, setIsEraser] = useState(false);
  const [canvasW, setCanvasW] = useState(0);
  const [canvasH, setCanvasH] = useState(0);

  // Line drawing state: waiting for second click to complete the line
  const [pendingStart, setPendingStart] = useState<Point | null>(null);

  // Mutable refs for drawing (avoid stale closures in event handlers)
  const isDrawingRef = useRef(false);
  const inProgressRef = useRef<Point[]>([]);
  const draggingHandleRef = useRef<'start' | 'end' | null>(null);
  const annotationsRef = useRef(annotations);
  const brushSizeRef = useRef(brushSize);
  const isEraserRef = useRef(isEraser);
  annotationsRef.current = annotations;
  brushSizeRef.current = brushSize;
  isEraserRef.current = isEraser;

  // ------- Resize observer: keep canvas pixel dimensions in sync with display size -------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver((entries) => {
      const w = Math.round(entries[0].contentRect.width);
      const h = Math.round(w * (nativeH / nativeW));
      setCanvasW(w);
      setCanvasH(h);
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, [nativeW, nativeH]);

  // ------- Resize: set canvas pixel dimensions and redraw -------
  useEffect(() => {
    if (canvasW === 0 || canvasH === 0) return;
    const bc = brushCanvasRef.current;
    const lc = lineCanvasRef.current;
    if (!bc || !lc) return;
    bc.width = canvasW;
    bc.height = canvasH;
    lc.width = canvasW;
    lc.height = canvasH;
    redrawBrushCanvas(bc, annotationsRef.current.strokes);
    redrawLineCanvas(lc, annotationsRef.current.placementLine);
  }, [canvasW, canvasH]);

  // ------- Redraw when annotations change -------
  const redrawBrush = useCallback(() => {
    const bc = brushCanvasRef.current;
    if (bc && bc.width > 0) redrawBrushCanvas(bc, annotations.strokes);
  }, [annotations.strokes]);

  const redrawLine = useCallback(() => {
    const lc = lineCanvasRef.current;
    if (lc && lc.width > 0) redrawLineCanvas(lc, annotations.placementLine);
  }, [annotations.placementLine]);

  useEffect(() => { redrawBrush(); }, [redrawBrush]);
  useEffect(() => { redrawLine(); }, [redrawLine]);

  // ------- Brush event handlers -------
  function handleBrushPointerDown(clientX: number, clientY: number) {
    const bc = brushCanvasRef.current;
    if (!bc) return;
    isDrawingRef.current = true;
    inProgressRef.current = [toNorm(clientX, clientY, bc)];
  }

  function handleBrushPointerMove(clientX: number, clientY: number) {
    const bc = brushCanvasRef.current;
    if (!bc || !isDrawingRef.current) return;
    const pt = toNorm(clientX, clientY, bc);
    inProgressRef.current.push(pt);
    redrawBrushCanvas(bc, annotationsRef.current.strokes, {
      points: inProgressRef.current,
      brushSize: BRUSH_SIZES[brushSizeRef.current],
      isEraser: isEraserRef.current,
    });
  }

  function handleBrushPointerUp() {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const pts = inProgressRef.current;
    if (pts.length > 0) {
      const newStroke: Stroke = {
        points: pts,
        brushSize: BRUSH_SIZES[brushSizeRef.current],
        isEraser: isEraserRef.current,
      };
      onChange({ ...annotationsRef.current, strokes: [...annotationsRef.current.strokes, newStroke] });
    }
    inProgressRef.current = [];
  }

  // ------- Line event handlers -------
  function handleLinePointerDown(clientX: number, clientY: number) {
    const lc = lineCanvasRef.current;
    if (!lc) return;
    const pt = toNorm(clientX, clientY, lc);

    // Check if clicking a handle to drag it
    const hit = hitHandle(pt, annotationsRef.current.placementLine, lc.width, lc.height);
    if (hit) {
      draggingHandleRef.current = hit;
      return;
    }

    // No handle hit: start a new line
    setPendingStart(pt);
    onChange({ ...annotationsRef.current, placementLine: null });
  }

  function handleLinePointerMove(clientX: number, clientY: number) {
    const lc = lineCanvasRef.current;
    if (!lc) return;

    if (draggingHandleRef.current) {
      const pt = toNorm(clientX, clientY, lc);
      const current = annotationsRef.current.placementLine;
      if (!current) return;
      const updated = draggingHandleRef.current === 'start'
        ? { ...current, start: pt }
        : { ...current, end: pt };
      onChange({ ...annotationsRef.current, placementLine: updated });
    }
  }

  function handleLinePointerUp(clientX: number, clientY: number) {
    const lc = lineCanvasRef.current;
    if (!lc) return;

    if (draggingHandleRef.current) {
      draggingHandleRef.current = null;
      return;
    }

    // Completing a new line
    setPendingStart((start) => {
      if (start) {
        const end = toNorm(clientX, clientY, lc);
        // Only commit if start and end are meaningfully different
        const dx = (end.x - start.x) * lc.width;
        const dy = (end.y - start.y) * lc.height;
        if (Math.sqrt(dx * dx + dy * dy) > 5) {
          onChange({ ...annotationsRef.current, placementLine: { start, end } });
        }
      }
      return null;
    });
  }

  // ------- Download annotated image at native resolution -------
  function handleDownload() {
    const img = imgRef.current;
    if (!img) return;

    const off = document.createElement('canvas');
    off.width = nativeW;
    off.height = nativeH;
    const ctx = off.getContext('2d');
    if (!ctx) return;

    // 1. Draw the original photo
    ctx.drawImage(img, 0, 0, nativeW, nativeH);

    // 2. Draw brush strokes scaled to native resolution
    const { strokes, placementLine } = annotationsRef.current;
    if (strokes.length > 0) {
      const brushOff = document.createElement('canvas');
      brushOff.width = nativeW;
      brushOff.height = nativeH;
      const bCtx = brushOff.getContext('2d');
      if (bCtx) {
        for (const stroke of strokes) {
          if (stroke.points.length < 2) continue;
          bCtx.save();
          bCtx.lineWidth = stroke.brushSize * (nativeW / 600);
          bCtx.lineCap = 'round';
          bCtx.lineJoin = 'round';
          if (stroke.isEraser) {
            bCtx.globalCompositeOperation = 'destination-out';
            bCtx.strokeStyle = 'rgba(0,0,0,1)';
          } else {
            bCtx.globalCompositeOperation = 'source-over';
            bCtx.strokeStyle = 'rgb(59,130,246)';
          }
          bCtx.beginPath();
          bCtx.moveTo(stroke.points[0].x * nativeW, stroke.points[0].y * nativeH);
          for (let i = 1; i < stroke.points.length; i++) {
            bCtx.lineTo(stroke.points[i].x * nativeW, stroke.points[i].y * nativeH);
          }
          bCtx.stroke();
          bCtx.restore();
        }
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.drawImage(brushOff, 0, 0);
        ctx.restore();
      }
    }

    // 3. Draw placement line at native resolution
    if (placementLine) {
      const sx = placementLine.start.x * nativeW;
      const sy = placementLine.start.y * nativeH;
      const ex = placementLine.end.x * nativeW;
      const ey = placementLine.end.y * nativeH;
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = Math.max(3, nativeW / 400);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      const hr = HANDLE_RADIUS * (nativeW / 600);
      for (const [px, py] of [[sx, sy], [ex, ey]] as [number, number][]) {
        ctx.beginPath();
        ctx.arc(px, py, hr, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = Math.max(2, nativeW / 800);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. Trigger download
    const a = document.createElement('a');
    a.href = off.toDataURL('image/png');
    a.download = 'space-annotated.png';
    a.click();
  }

  // ------- Clear handlers -------
  function clearBrush() { onChange({ ...annotations, strokes: [] }); setIsEraser(false); }
  function clearLine() { onChange({ ...annotations, placementLine: null }); setPendingStart(null); }

  const hasBrush = annotations.strokes.length > 0;
  const hasLine = annotations.placementLine !== null;
  const hasAny = hasBrush || hasLine;

  const lineStatusText = hasLine
    ? 'Drag the red handles to adjust'
    : pendingStart
    ? 'Click to set the end point'
    : 'Click to set the start point';

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Annotate your space photo</h3>
      <p className="text-xs text-slate-500 leading-relaxed -mt-1">
        Mark where the object should go. The annotated image exports as a PNG you upload to Gemini alongside the prompt.
      </p>

      {/* Mode toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded-lg overflow-hidden border border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => setMode('brush')}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              mode === 'brush' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Brush mask
          </button>
          <button
            type="button"
            onClick={() => setMode('line')}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors border-l border-slate-700 ${
              mode === 'line' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Placement line
          </button>
        </div>

        {mode === 'brush' && (
          <>
            <select
              value={brushSize}
              onChange={(e) => setBrushSize(e.target.value as BrushSize)}
              className="px-2 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
            <button
              type="button"
              onClick={() => setIsEraser((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                isEraser
                  ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isEraser ? 'Eraser on' : 'Eraser'}
            </button>
            {hasBrush && (
              <button
                type="button"
                onClick={clearBrush}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 bg-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-colors"
              >
                Clear
              </button>
            )}
          </>
        )}

        {mode === 'line' && (
          <>
            <span className="text-xs text-slate-500 italic">{lineStatusText}</span>
            {hasLine && (
              <button
                type="button"
                onClick={clearLine}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 bg-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-colors"
              >
                Clear
              </button>
            )}
          </>
        )}
      </div>

      {/* Canvas area: photo + two stacked annotation layers */}
      <div
        ref={containerRef}
        className="relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-700 select-none"
        style={{ aspectRatio: `${nativeW} / ${nativeH}` }}
      >
        {/* The space photo — never modified */}
        <img
          ref={imgRef}
          src={photoDataUrl}
          alt="Space"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          crossOrigin="anonymous"
        />

        {/* Brush layer — z-index 10, interactive only in brush mode */}
        <canvas
          ref={brushCanvasRef}
          className="absolute inset-0"
          style={{
            width: '100%',
            height: '100%',
            zIndex: mode === 'brush' ? 20 : 10,
            cursor: mode === 'brush' ? (isEraser ? 'cell' : 'crosshair') : 'default',
            pointerEvents: mode === 'brush' ? 'auto' : 'none',
            touchAction: 'none',
          }}
          onMouseDown={(e) => handleBrushPointerDown(e.clientX, e.clientY)}
          onMouseMove={(e) => handleBrushPointerMove(e.clientX, e.clientY)}
          onMouseUp={(e) => { handleBrushPointerUp(); void e; }}
          onMouseLeave={() => handleBrushPointerUp()}
          onTouchStart={(e) => { e.preventDefault(); handleBrushPointerDown(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchMove={(e) => { e.preventDefault(); handleBrushPointerMove(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchEnd={(e) => { e.preventDefault(); handleBrushPointerUp(); }}
        />

        {/* Line layer — z-index 10, interactive only in line mode */}
        <canvas
          ref={lineCanvasRef}
          className="absolute inset-0"
          style={{
            width: '100%',
            height: '100%',
            zIndex: mode === 'line' ? 20 : 10,
            cursor: mode === 'line' ? 'crosshair' : 'default',
            pointerEvents: mode === 'line' ? 'auto' : 'none',
            touchAction: 'none',
          }}
          onMouseDown={(e) => handleLinePointerDown(e.clientX, e.clientY)}
          onMouseMove={(e) => handleLinePointerMove(e.clientX, e.clientY)}
          onMouseUp={(e) => handleLinePointerUp(e.clientX, e.clientY)}
          onTouchStart={(e) => { e.preventDefault(); handleLinePointerDown(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchMove={(e) => { e.preventDefault(); handleLinePointerMove(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchEnd={(e) => { e.preventDefault(); handleLinePointerUp(e.changedTouches[0].clientX, e.changedTouches[0].clientY); }}
        />
      </div>

      {/* Download button — only shown when there is something to download */}
      {hasAny && (
        <button
          type="button"
          onClick={handleDownload}
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white transition-colors border border-slate-600"
        >
          Download annotated photo
        </button>
      )}
    </div>
  );
}
