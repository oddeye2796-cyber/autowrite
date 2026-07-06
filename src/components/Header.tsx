import React from "react";
import { FileText, Cpu, AlertCircle, RefreshCw, Settings } from "lucide-react";

interface HeaderProps {
  title?: string;
  hasOutline: boolean;
  onReset: () => void;
  isBulkGenerating: boolean;
  onOpenSettings: () => void;
}

export default function Header({ title, hasOutline, onReset, isBulkGenerating, onOpenSettings }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white shadow-sm transition-all duration-300 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Branding */}
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-800 tracking-tight block">
                {title || "대용량 사업계획서 자동 작성기"}
              </span>
              <span className="text-xs text-indigo-600 font-medium tracking-wide flex items-center gap-1">
                <Cpu className="h-3 w-3" /> Gemini 2.5 AI Core Engine
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>서버 API 연동 완료</span>
            </div>

            {hasOutline && (
              <button
                onClick={onReset}
                disabled={isBulkGenerating}
                className={`flex items-center space-x-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  isBulkGenerating ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>새로 분석하기</span>
              </button>
            )}

            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center p-2 rounded-md border border-slate-300 bg-white text-slate-600 hover:text-slate-900 shadow-sm transition hover:bg-slate-50 cursor-pointer"
              title="설정 및 Secrets"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
