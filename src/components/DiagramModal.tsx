import React from "react";
import { Image, X, Sparkles, Check } from "lucide-react";

interface DiagramModalProps {
  show: boolean;
  onClose: () => void;
  prompt: string;
  setPrompt: (v: string) => void;
  style: string;
  setStyle: (v: any) => void;
  aspectRatio: string;
  setAspectRatio: (v: any) => void;
  isGenerating: boolean;
  generatedUrl: string | null;
  error: string | null;
  onGenerate: () => void;
  onInsert: () => void;
}

export function DiagramModal({
  show,
  onClose,
  prompt,
  setPrompt,
  style,
  setStyle,
  aspectRatio,
  setAspectRatio,
  isGenerating,
  generatedUrl,
  error,
  onGenerate,
  onInsert
}: DiagramModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 rounded-lg">
              <Image className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">AI 기술 구조도 및 프로세스 맵 생성</h3>
              <p className="text-[10px] text-slate-500">RFP 요구사항 및 문맥을 파악한 맞춤형 다이어그램을 생성합니다.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> 도식화 세부 설명 입력 (한글)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 클라우드 컨테이너 분산 아키텍처 (VPC, API Gateway, Microservices 구조 및 이중화 흐름도)"
              rows={3}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-mono"
            />
            
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 self-center">추천 템플릿:</span>
              <button
                onClick={() => setPrompt("하이브리드 클라우드 물리/상태 정보 보안 연동 시스템 아키텍처 흐름도")}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full transition"
              >
                #보안망구성도
              </button>
              <button
                onClick={() => setPrompt("3단 레이어 분산 처리 데이터 수집 파이프라인 (Kafka, Spark, NoSQL)")}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full transition"
              >
                #데이터처리도
              </button>
              <button
                onClick={() => setPrompt("실시간 무중단 마이그레이션 백업 및 장애 대응 전환 시스템 시퀀스 맵")}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full transition"
              >
                #이중화시퀀스
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">다이어그램 렌더링 스타일</label>
              <select
                value={style}
                onChange={(e: any) => setStyle(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="isometric">입체 3D 아이소메트릭 테크 스타일</option>
                <option value="flat">플랫 미니멀리즘 플로우 차트</option>
                <option value="blueprint">정밀 엔지니어링 청사진 (Blueprint)</option>
                <option value="infographic">전문 비즈니스 인포그래픽 맵</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">이미지 화면 비율</label>
              <select
                value={aspectRatio}
                onChange={(e: any) => setAspectRatio(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="16:9">와이드 가로형 (16:9)</option>
                <option value="4:3">표준 가로형 (4:3)</option>
              </select>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl bg-slate-50/50 p-4 min-h-[220px] flex flex-col items-center justify-center relative overflow-hidden">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center animate-pulse">
                <svg className="animate-spin h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div>
                  <p className="text-xs font-bold text-slate-800">Gemini Image AI 모델이 다이어그램을 작도 중입니다...</p>
                  <p className="text-[10px] text-slate-500">실시간 프롬프트 보정 및 가상 시스템 그리드 설계가 병렬 인코딩되고 있습니다.</p>
                </div>
              </div>
            ) : generatedUrl ? (
              <div className="space-y-3 w-full text-center">
                <img 
                  src={generatedUrl} 
                  alt="AI generated technical blueprint diagram" 
                  className="rounded-xl shadow-md border border-slate-200 max-h-[180px] mx-auto object-contain"
                  referrerPolicy="no-referrer"
                />
                {error && (
                  <p className="text-[10px] text-amber-600 text-center bg-amber-50 p-1.5 rounded border border-amber-100 font-medium leading-relaxed">
                    ⚠️ 알림: {error}
                  </p>
                )}
                <p className="text-[11px] text-indigo-600 font-bold">
                  ✓ 아키텍처 생성이 완료되었습니다. 제안서 본문에 삽입하십시오.
                </p>
              </div>
            ) : (
              <div className="text-center p-8 text-slate-400">
                <Image className="h-10 w-10 mx-auto mb-2 opacity-30 text-indigo-600" />
                <p className="text-xs font-semibold">생성된 다이어그램이 아직 없습니다.</p>
                <p className="text-[10px] text-slate-400">설명을 명시하고 생성 버튼을 누르시면, 초정밀 일러스트 도식화가 출력됩니다.</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-indigo-600 font-bold">
            💡 인쇄물에 바로 결합할 수 있는 고해상도 이미지 포맷 대응
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              취소
            </button>
            {!generatedUrl ? (
              <button
                onClick={onGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="inline-flex items-center space-x-1 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-40"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI 이미지 생성</span>
              </button>
            ) : (
              <button
                onClick={onInsert}
                className="inline-flex items-center space-x-1 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <Check className="h-3.5 w-3.5" />
                <span>이 챕터 본문에 즉시 삽입</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
