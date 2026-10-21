import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { Monitor, Tablet, Smartphone, Sun, Moon, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ComponentLivePreview } from '../../components/previews/ComponentLivePreview';
import { ComponentFile, ComponentProp } from '@vac/shared';

interface ErrorBoundaryProps {
  children: ReactNode;
  resetKey: number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class StudioPreviewErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Studio preview runtime error:', error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 space-y-3 max-w-md mx-auto">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Runtime Preview Execution Error</span>
          </div>
          <p className="text-xs text-rose-400 font-mono bg-rose-950/40 p-3 rounded-xl overflow-x-auto">
            {this.state.error?.message || 'An unhandled exception occurred while rendering this component draft.'}
          </p>
          <p className="text-[11px] text-gray-400">
            Fix the component JSX syntax or props in the Source Editor and click Reset Preview.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface StudioDraftPreviewProps {
  slug: string;
  name: string;
  description: string;
  files: ComponentFile[];
  props?: ComponentProp[];
  syntaxError?: string | null;
}

export const StudioDraftPreview: React.FC<StudioDraftPreviewProps> = ({
  slug,
  name,
  description,
  files,
  syntaxError,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [resetKey, setResetKey] = useState(0);

  const officialSlugs = [
    'animated-login-form',
    'glassmorphism-navbar',
    'interactive-pricing',
    'analytics-dashboard',
    'notification-center',
    'file-upload',
    'glass-button',
    'toggle-switch',
    'dark-glass-card',
  ];

  const getViewportMaxWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[340px]';
      case 'tablet':
        return 'max-w-[580px]';
      default:
        return 'max-w-full';
    }
  };

  const entryFile = files.find((f) => f.isEntry || f.name.endsWith('.tsx') || f.name.endsWith('.jsx')) || files[0];

  return (
    <div className="space-y-4">
      {/* Top Preview Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-500 dark:text-gray-400">Viewport:</span>
          <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setViewport('desktop')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
                viewport === 'desktop'
                  ? 'bg-white dark:bg-white/10 text-[#5B4FF5] font-semibold shadow-xs'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
                viewport === 'tablet'
                  ? 'bg-white dark:bg-white/10 text-[#5B4FF5] font-semibold shadow-xs'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet (580px)</span>
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
                viewport === 'mobile'
                  ? 'bg-white dark:bg-white/10 text-[#5B4FF5] font-semibold shadow-xs'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (340px)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setPreviewTheme(previewTheme === 'dark' ? 'light' : 'dark')}
            className="px-3 py-1.5 rounded-xl border border-[#E8EAEF] dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition-colors"
          >
            {previewTheme === 'dark' ? <Moon className="w-3.5 h-3.5 text-purple-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            <span className="capitalize">{previewTheme} Canvas</span>
          </button>

          <button
            onClick={() => setResetKey((k) => k + 1)}
            className="px-3 py-1.5 rounded-xl border border-[#E8EAEF] dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-[#5B4FF5]" />
            <span>Reset State</span>
          </button>
        </div>
      </div>

      {/* Syntax Error Notice if present */}
      {syntaxError && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Syntax alert in source: {syntaxError}</span>
        </div>
      )}

      {/* Isolated Viewport Frame */}
      <div
        className={`w-full ${getViewportMaxWidth()} mx-auto transition-all duration-300 rounded-3xl border border-[#E8EAEF] dark:border-white/10 p-8 min-h-[360px] flex items-center justify-center shadow-xl ${
          previewTheme === 'dark' ? 'bg-[#0A0B10] text-white' : 'bg-[#F8FAFC] text-gray-900'
        }`}
      >
        <div key={resetKey} className="w-full">
          <StudioPreviewErrorBoundary resetKey={resetKey}>
            {officialSlugs.includes(slug) ? (
              <ComponentLivePreview slug={slug} />
            ) : (
              <div className="w-full max-w-md mx-auto p-6 rounded-2xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 shadow-2xl backdrop-blur-xl text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-[#5B4FF5] flex items-center justify-center mx-auto border border-purple-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {description || 'Live Component Studio Draft.'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 text-left text-xs font-mono space-y-1">
                  <div className="text-gray-400 text-[10px]">ENTRY: {entryFile?.name || 'index.tsx'}</div>
                  <div className="text-[#5B4FF5] text-[11px] truncate">
                    // Ready for production compilation
                  </div>
                </div>
              </div>
            )}
          </StudioPreviewErrorBoundary>
        </div>
      </div>
    </div>
  );
};
