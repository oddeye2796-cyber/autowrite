import React from "react";
import { X, ShieldCheck, AlertCircle, AlertTriangle, Info, CheckCircle2, RefreshCw } from "lucide-react";

interface ConsistencyModalProps {
  show: boolean;
  onClose: () => void;
  isChecking: boolean;
  error: string | null;
  results: any[] | null;
  score: number | null;
  companyName: string;
  projectDuration: string;
  onCheck: () => void;
}

export function ConsistencyModal({
  show,
  onClose,
  isChecking,
  error,
  results,
  score,
  companyName,
  projectDuration,
  onCheck
}: ConsistencyModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">수석 제안 감리단 인공지능 문서 정합성 점검</h3>
              <p className="text-[10px] text-slate-500">회사명, 사업 수행 기간, 제안전략 및 문체의 일관성 유무를 전수 비교합니다.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {isChecking ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
              <svg className="animate-spin h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div>
                <h4 className="text-xs font-bold text-slate-800">전체 목차 및 핵심 지표 교차 정량 분석 중...</h4>
                <p className="text-[10px] text-slate-500">설정된 수행사명: <span className="font-semibold text-indigo-600">"{companyName}"</span> | 사업 기간: <span className="font-semibold text-indigo-600">"{projectDuration}"</span></p>
                <p className="text-[9px] text-slate-400 mt-2">일련의 서술 문맥, 제안 수치 매칭 여부, 논리 충돌 여부를 감리하고 있습니다.</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 border border-rose-100 rounded-xl bg-rose-50/50 flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-rose-800">점검 오류 발생</h4>
                <p className="text-[10px] text-rose-600">{error}</p>
                <button
                  onClick={onCheck}
                  className="mt-2 text-[10px] font-bold text-indigo-600 hover:underline"
                >
                  다시 정합성 체크 실행하기
                </button>
              </div>
            </div>
          ) : results ? (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 flex items-center justify-center rounded-full bg-slate-50 border-4 border-indigo-500 shadow-inner">
                    <span className="text-lg font-black text-slate-800">{score}</span>
                    <span className="text-[9px] text-slate-500 absolute bottom-1">점</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">문서 정합성 신뢰 지수</h4>
                    <p className="text-[10px] text-slate-500">
                      {score && score >= 90 ? "★ 최우수 - 즉시 조달청 및 고객사 제출 가능 품질" :
                       score && score >= 70 ? "☆ 양호 - 미세한 키워드 불일치 교정 권장" :
                       "⚠️ 보완 필요 - 핵심 기간 수치 모순 또는 미작성 항목 대량 발견"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center shrink-0">
                  <div className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                    <span className="block text-[10px] text-emerald-800 font-bold">오류 없음</span>
                    <span className="text-xs font-extrabold text-emerald-600">
                      {results.filter(r => r.type === "success").length}건
                    </span>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
                    <span className="block text-[10px] text-amber-800 font-bold">주의 검토</span>
                    <span className="text-xs font-extrabold text-amber-600">
                      {results.filter(r => r.type === "warning").length}건
                    </span>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl">
                    <span className="block text-[10px] text-rose-800 font-bold">치명적 모순</span>
                    <span className="text-xs font-extrabold text-rose-600">
                      {results.filter(r => r.type === "error").length}건
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700">전수 교차 감리 정밀 진단서</h4>
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {results.map((result, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-xl border flex gap-3.5 transition bg-white shadow-sm ${
                        result.type === "error" ? "border-rose-100 bg-rose-50/20" :
                        result.type === "warning" ? "border-amber-100 bg-amber-50/20" :
                        "border-emerald-100 bg-emerald-50/20"
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {result.type === "error" ? (
                          <div className="p-1 bg-rose-100 rounded text-rose-700">
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                        ) : result.type === "warning" ? (
                          <div className="p-1 bg-amber-100 rounded text-amber-700">
                            <Info className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="p-1 bg-emerald-100 rounded text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 flex-1 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-800">{result.field}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                              {result.section}
                            </span>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            result.type === "error" ? "bg-rose-100 text-rose-800" :
                            result.type === "warning" ? "bg-amber-100 text-amber-800" :
                            "bg-emerald-100 text-emerald-800"
                          }`}>
                            {result.type === "error" ? "치명적 수정필요" :
                             result.type === "warning" ? "주의 권고" : "검증 통과"}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed font-normal">
                          {result.description}
                        </p>
                        {result.resolution && (
                          <div className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-lg mt-2 text-[11px] text-slate-600 leading-relaxed font-mono">
                            <span className="font-bold text-indigo-600 block mb-1">💡 수정 권장안:</span>
                            {result.resolution}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <ShieldCheck className="h-10 w-10 mx-auto mb-2 opacity-30 text-indigo-600" />
              <p className="text-xs font-semibold">점검 내역이 없습니다.</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            닫기
          </button>
          <button
            onClick={onCheck}
            className="inline-flex items-center space-x-1 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>재점검 수행</span>
          </button>
        </div>
      </div>
    </div>
  );
}
