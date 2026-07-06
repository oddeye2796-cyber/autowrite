import React, { useState, useRef } from "react";
import { Upload, FileText, ArrowRight, Settings, Sparkles, Building2, Calendar, Clipboard, RefreshCw, BookOpen, Layers } from "lucide-react";

interface RfpInputFormProps {
  onAnalyze: (config: {
    announcementText: string;
    rfpText: string;
    templateText: string;
    referenceText: string;
    companyName: string;
    projectDuration: string;
    writingStyle: string;
    customPrompt: string;
    targetPages: number;
  }) => void;
  isLoading: boolean;
  onImportBackup?: (backupData: any) => void;
}

export default function RfpInputForm({ onAnalyze, isLoading, onImportBackup }: RfpInputFormProps) {
  // 4 Document inputs
  const [announcementText, setAnnouncementText] = useState("");
  const [rfpText, setRfpText] = useState("");
  const [templateText, setTemplateText] = useState("");
  const [referenceText, setReferenceText] = useState("");

  const [companyName, setCompanyName] = useState("코리아 글로벌 테크");
  const [projectDuration, setProjectDuration] = useState("12개월");
  const [writingStyle, setWritingStyle] = useState("bullet");
  const [targetPages, setTargetPages] = useState(300);
  const [customPrompt, setCustomPrompt] = useState("");

  const jsonImportRef = useRef<HTMLInputElement>(null);

  // Loading / Dragging status per input
  const [isParsing, setIsParsing] = useState<{ [key: string]: boolean }>({
    announcement: false,
    rfp: false,
    template: false,
    reference: false,
  });

  const [isDragging, setIsDragging] = useState<{ [key: string]: boolean }>({
    announcement: false,
    rfp: false,
    template: false,
    reference: false,
  });

  // File Input Refs
  const fileRefs = {
    announcement: useRef<HTMLInputElement>(null),
    rfp: useRef<HTMLInputElement>(null),
    template: useRef<HTMLInputElement>(null),
    reference: useRef<HTMLInputElement>(null),
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const processFiles = async (files: FileList | File[], target: "announcement" | "rfp" | "template" | "reference") => {
    if (files.length === 0) return;
    
    setIsParsing(prev => ({ ...prev, [target]: true }));

    try {
      let combinedText = "";
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await convertToBase64(file);

        const response = await fetch("/api/parse-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64,
            filename: file.name,
            filetype: file.type,
          }),
        });

        if (!response.ok) {
          let errorMsg = `${file.name} 해독에 실패했습니다.`;
          try {
            // First try to parse as JSON
            const textResponse = await response.text();
            try {
              const errData = JSON.parse(textResponse);
              if (errData.error) errorMsg = errData.error;
            } catch (jsonErr) {
              // If it's not JSON, it might be a Vercel plain text/HTML error
              if (response.status === 413) {
                errorMsg = "파일 용량이 너무 큽니다. (Vercel 제한 4.5MB 이하 권장)";
              } else if (textResponse.includes("A server error") || response.status >= 500) {
                errorMsg = "서버 타임아웃 또는 처리 오류가 발생했습니다. 파일 크기나 형식을 확인해주세요. (Vercel 제한 4.5MB 이하 및 10초 이내 처리 권장)";
              } else {
                errorMsg = `서버 오류 (${response.status}): ${textResponse.slice(0, 50)}...`;
              }
            }
          } catch (e) {
            // Fallback if even text() fails
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        const extractedText = data.text || "";
        combinedText += `\n\n--- [등록 파일: ${file.name}] ---\n${extractedText}`;
      }

      const updateText = (prev: string) => prev ? prev + combinedText : combinedText.trim();
      
      if (target === "announcement") setAnnouncementText(updateText);
      else if (target === "rfp") setRfpText(updateText);
      else if (target === "template") setTemplateText(updateText);
      else if (target === "reference") setReferenceText(updateText);

    } catch (err: any) {
      alert(`[문서 파일 로딩 에러] ${err.message || "파일을 해독할 수 없습니다."}\n(PDF, Word, HWP, TXT 파일 형식을 권장합니다.)`);
    } finally {
      setIsParsing(prev => ({ ...prev, [target]: false }));
    }
  };

  const handleDragOver = (e: React.DragEvent, target: string) => {
    e.preventDefault();
    setIsDragging(prev => ({ ...prev, [target]: true }));
  };

  const handleDragLeave = (target: string) => {
    setIsDragging(prev => ({ ...prev, [target]: false }));
  };

  const handleDrop = (e: React.DragEvent, target: "announcement" | "rfp" | "template" | "reference") => {
    e.preventDefault();
    setIsDragging(prev => ({ ...prev, [target]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files, target);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: "announcement" | "rfp" | "template" | "reference") => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files, target);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfpText.trim() && !announcementText.trim()) {
      alert("최소 한 개 이상의 공고문 또는 RFP 내용을 입력하거나 파일을 등록해주세요.");
      return;
    }
    onAnalyze({
      announcementText,
      rfpText,
      templateText,
      referenceText,
      companyName,
      projectDuration,
      writingStyle,
      customPrompt,
      targetPages,
    });
  };

  // Helper render for document slot
  const renderDocInput = (
    id: "announcement" | "rfp" | "template" | "reference",
    numLabel: string,
    titleLabel: string,
    placeholder: string,
    required = false
  ) => {
    const textValue = 
      id === "announcement" ? announcementText :
      id === "rfp" ? rfpText :
      id === "template" ? templateText : referenceText;

    const setTextValue = 
      id === "announcement" ? setAnnouncementText :
      id === "rfp" ? setRfpText :
      id === "template" ? setTemplateText : setReferenceText;

    const isParsingSlot = isParsing[id];
    const isDraggingSlot = isDragging[id];

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
            <span className="inline-flex items-center justify-center h-4.5 w-4.5 rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600 border border-indigo-100">
              {numLabel}
            </span>
            <span>{titleLabel}</span>
            {required && <span className="text-rose-500 font-bold">*</span>}
          </label>
          <button
            type="button"
            onClick={() => fileRefs[id].current?.click()}
            className="text-xs text-indigo-600 font-semibold hover:underline"
            disabled={isParsingSlot}
          >
            파일 다중 선택
          </button>
          <input
            ref={fileRefs[id]}
            type="file"
            multiple
            accept=".txt,.md,.json,.pdf,.docx,.doc,.hwp,.hwpx"
            className="hidden"
            onChange={(e) => handleFileChange(e, id)}
          />
        </div>

        <div
          onDragOver={(e) => handleDragOver(e, id)}
          onDragLeave={() => handleDragLeave(id)}
          onDrop={(e) => handleDrop(e, id)}
          onClick={(e) => {
            // Trigger file input click if clicking on the placeholder or the container itself, but not the active textarea
            const targetEl = e.target as HTMLElement;
            if (targetEl === e.currentTarget || targetEl.closest('.pointer-events-none') || textValue.length === 0) {
              fileRefs[id].current?.click();
            }
          }}
          className={`relative rounded-xl border-2 border-dashed p-4 transition-all duration-200 cursor-pointer ${
            isDraggingSlot
              ? "border-indigo-500 bg-indigo-50/20"
              : "border-slate-200 bg-slate-50/40 hover:border-slate-300"
          }`}
        >
          <textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder={placeholder}
            rows={7}
            className="w-full resize-none border-0 bg-transparent p-0 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-0 leading-relaxed font-mono"
            required={required}
            disabled={isParsingSlot}
          />

          {isParsingSlot && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 text-indigo-600 rounded-xl space-y-2 z-10">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <p className="text-[11px] font-extrabold text-slate-800">문서를 스마트 텍스트 추출 중...</p>
            </div>
          )}

          {textValue.length === 0 && !isParsingSlot && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50/20 rounded-xl">
              <Upload className="h-6 w-6 mb-1 text-slate-300" />
              <p className="text-[11px] font-semibold">드래그앤드롭으로 파일을 놓으세요</p>
              <p className="text-[9px] text-slate-400">PDF, Word, HWPX, HWP, TXT 다중 지원</p>
            </div>
          )}
        </div>

        <div className="flex justify-between text-[10px] text-slate-400 px-1">
          <span>문서 글자수: {textValue.length.toLocaleString()} 자</span>
          <span>공고용 고화질 파서 가동</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Introduction Card */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-white to-sky-50/30 p-6 md:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-4">
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span>AI-Driven Enterprise Document Architect</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
            4대 핵심 문서 통합 <span className="text-indigo-600 font-black">대용량 사업계획서</span> 생성기
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            사업 공고문, RFP, 기관 표준 양식, 그리고 참고 기술 사양 문서를 유기적으로 파싱 및 상호 연계합니다.
            AI는 요구 조항별로 최상의 기술 아키텍처, 일정 수립, 투입 인력 및 예산 계획을 컴파일해 <strong>300페이지 규격의 전문 보고서</strong>를 생성해냅니다.
          </p>
        </div>
      </div>

      {/* Form Submission */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-500" /> 제안 기본 정보 및 문서 설정
          </h2>
          {onImportBackup && (
            <div>
              <button
                type="button"
                onClick={() => jsonImportRef.current?.click()}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-xs font-bold text-indigo-700 transition cursor-pointer"
              >
                <Clipboard className="h-3.5 w-3.5" />
                <span>이전 기획 백업 불러오기 (.json)</span>
              </button>
              <input
                ref={jsonImportRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    try {
                      const data = JSON.parse(evt.target?.result as string);
                      if (data.projectTitle && data.sections) {
                        onImportBackup(data);
                      } else {
                        alert("올바른 사업계획서 백업 JSON 파일이 아닙니다.");
                      }
                    } catch (err) {
                      alert("JSON 파일을 파싱하는 데 실패했습니다.");
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </div>
          )}
        </div>

        {/* Input Parameters */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-indigo-500" /> 제안사명 (회사명)
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="예: 코리아 테크놀로지"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-indigo-500" /> 사업 수행 기간
              </label>
              <input
                type="text"
                value={projectDuration}
                onChange={(e) => setProjectDuration(e.target.value)}
                placeholder="예: 12개월 (단기/장기)"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-indigo-500" /> 제안서 집필 문체 (Style)
              </label>
              <select
                value={writingStyle}
                onChange={(e) => setWritingStyle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
              >
                <option value="bullet">전문가용 개조식 (명사형 종결, 가독성 극대화)</option>
                <option value="formal">신뢰감을 주는 평서체 (~다로 끝나는 서술형)</option>
                <option value="polite">설득력 있는 정중한 경어체 (~습니다, ~합니다)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-indigo-500" /> 목표 페이지 분량 (Budget)
              </label>
              <select
                value={targetPages}
                onChange={(e) => setTargetPages(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
              >
                <option value={50}>50 페이지 내외 (소형 요약 제안서)</option>
                <option value={100}>100 페이지 내외 (일반 간이 제안서)</option>
                <option value={200}>200 페이지 내외 (중견 기업/중형 국책 사업)</option>
                <option value={300}>300 페이지 내외 (표준 대형 사업계획서 규격)</option>
                <option value={500}>500 페이지 내외 (초대형 인프라/컨소시엄 기획)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> 추가 프롬프팅 요구사항 및 기획 강조 지시어 (선택)
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="예: '보안 설루션 구축 방안을 최우선으로 강조하고, 클라우드 네이티브 아키텍처 환경을 전제로 작성하라.' 또는 '투입 인력 배치 시 수석 엔지니어 위주로 강점을 보여라.' 등 AI에게 내릴 특별한 지시사항을 자유롭게 입력해 주세요."
              rows={2}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none font-mono"
            />
          </div>
        </div>

        {/* 4 Slots Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          {/* 1. 공고문 */}
          {renderDocInput(
            "announcement",
            "1",
            "공고문 문서",
            "발주 기관의 일반 사업 공고문 내용이나 요약 사항을 넣거나 파일을 업로드해 주세요.",
            true
          )}

          {/* 2. RFP */}
          {renderDocInput(
            "rfp",
            "2",
            "제안요청서 (RFP)",
            "핵심 요구 기술 및 과업 내역서, 점수 평가 기준표(RFP)를 입력하거나 파일을 올려주세요.",
            true
          )}

          {/* 3. 표준 양식 */}
          {renderDocInput(
            "template",
            "3",
            "표준 양식 및 목차",
            "지정된 사업계획서 템플릿 목차 구조가 있다면 여기에 등록해 주세요. 없을 시 표준 최적화 규격으로 지능 자동 설계됩니다.",
            false
          )}

          {/* 4. 참고 문서 */}
          {renderDocInput(
            "reference",
            "4",
            "기술 및 사업 참고 문서",
            "회사 카탈로그, 과거 유사실적 자료, 세부 사양서 등 제안서 살을 붙이는 데 활용할 참조 텍스트나 파일을 등록해 주세요.",
            false
          )}
        </div>



        {/* Action Button */}
        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isLoading || (!rfpText.trim() && !announcementText.trim())}
            className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-6 py-4 text-sm font-extrabold text-white shadow-md transition-all duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              isLoading || (!rfpText.trim() && !announcementText.trim())
                ? "opacity-50 cursor-not-allowed bg-slate-400"
                : "hover:scale-[1.02] hover:shadow-lg active:scale-95"
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>4개 문서 교차 지능형 정밀 분석 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5" />
                <span>문서 분석 및 {targetPages}P 규모 목차 고성능 설계 시작</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
