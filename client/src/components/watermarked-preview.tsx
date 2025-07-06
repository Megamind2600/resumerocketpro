import { useEffect, useRef } from "react";

interface WatermarkedPreviewProps {
  content: string;
  title: string;
  className?: string;
}

export default function WatermarkedPreview({ content, title, className = "" }: WatermarkedPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (previewRef.current && previewRef.current.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (previewRef.current && previewRef.current.contains(document.activeElement)) {
        if (e.ctrlKey && (e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'x')) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 ${className}`}>
      <div className="flex items-center justify-between p-6 border-b border-neutral-200">
        <h3 className="text-xl font-semibold text-neutral-800">{title}</h3>
        <div className="flex items-center space-x-2">
          <i className="fas fa-eye text-neutral-400"></i>
          <span className="text-sm text-neutral-500">Preview Mode</span>
        </div>
      </div>
      
      <div className="p-6">
        <div 
          ref={previewRef}
          className="relative bg-neutral-50 border border-neutral-200 rounded-lg p-6 min-h-[600px] overflow-hidden"
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
          }}
        >
          {/* Watermark */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none z-10"
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: 'rgba(0, 0, 0, 0.1)',
              whiteSpace: 'nowrap',
            }}
          >
            DEMO – Pay to Download
          </div>
          
          {/* Content */}
          <div className="relative z-0 text-sm text-neutral-600 whitespace-pre-wrap">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
