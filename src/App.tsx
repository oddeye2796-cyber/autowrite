import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  FileText,
  Sparkles,
  ArrowRight,
  BookOpen,
  Layers,
  Cpu,
  Download,
  CheckCircle2,
  Play,
  Pause,
  RefreshCw,
  Edit2,
  Trash2,
  Plus,
  HelpCircle,
  FileSpreadsheet,
  ChevronsRight,
  ListOrdered,
  BookMarked,
  Info,
  Sliders,
  Send,
  AlertTriangle,
  Image,
  ShieldCheck,
  X,
  AlertCircle,
  Check
} from "lucide-react";

import Header from "./components/Header";
import RfpInputForm from "./components/RfpInputForm";
import OverviewDashboard from "./components/OverviewDashboard";
import { ProposalOutline, ProposalSection, EvaluationCriterion } from "./types";

export default function App() {
  const [announcementText, setAnnouncementText] = useState("");
  const [rfpText, setRfpText] = useState("");
  const [templateText, setTemplateText] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [companyName, setCompanyName] = useState("코리아 글로벌 테크");
  const [projectDuration, setProjectDuration] = useState("12개월");
  const [writingStyle, setWritingStyle] = useState("bullet");
  const [rfpCustomPrompt, setRfpCustomPrompt] = useState("");

  const [isLoadingOutline, setIsLoadingOutline] = useState(false);
  const [outline, setOutline] = useState<ProposalOutline | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | "overview" | "all">("overview");

  // Multi-section auto compiler states
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState<number>(-1);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isCustomPromoting, setIsCustomPromoting] = useState(false);

  // Editable section state for fine-tuning
  const [editingContent, setEditingContent] = useState("");
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [exportFormat, setExportFormat] = useState<"md" | "doc" | "hwp" | "hwpx" | "txt" | "json">("md");

  // New section form state
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionParent, setNewSectionParent] = useState("");
  const [newSectionSub, setNewSectionSub] = useState("");
  const [newSectionFocus, setNewSectionFocus] = useState("");
  const [newSectionPages, setNewSectionPages] = useState(15);

  // AI Diagram states
  const [showDiagramModal, setShowDiagramModal] = useState(false);
  const [diagramSectionId, setDiagramSectionId] = useState("");
  const [diagramPrompt, setDiagramPrompt] = useState("");
  const [diagramStyle, setDiagramStyle] = useState<"isometric" | "flat" | "blueprint" | "infographic">("isometric");
  const [diagramAspectRatio, setDiagramAspectRatio] = useState<"16:9" | "4:3">("16:9");
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false);
  const [generatedDiagramUrl, setGeneratedDiagramUrl] = useState<string | null>(null);
  const [diagramError, setDiagramError] = useState<string | null>(null);

  // Document Consistency states
  const [showConsistencyModal, setShowConsistencyModal] = useState(false);
  const [isCheckingConsistency, setIsCheckingConsistency] = useState(false);
  const [consistencyResults, setConsistencyResults] = useState<any[] | null>(null);
  const [consistencyScore, setConsistencyScore] = useState<number | null>(null);
  const [consistencyError, setConsistencyError] = useState<string | null>(null);

  // Sync refs to avoid stale closures in bulk compile loop
  const outlineRef = useRef(outline);
  const isBulkGeneratingRef = useRef(isBulkGenerating);
  const isLoopRunningRef = useRef(false);

  // Auto-load mock data when ?mock=true&workspace=true queries are present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mock") === "true" && params.get("workspace") === "true") {
      const mockOutline: any = {
        projectTitle: "AI 기반 스마트 제조 지능화 플랫폼 구축 사업 (대형 공공)",
        projectGoal: "제조 공정 인공지능 분석, 실시간 설비 모니터링 및 클라우드 아키텍처 제안요청서",
        companyStrengthRecommendation: "제안기관은 제조 분야 AI 컨설팅 강점 보유 및 LSTM 이상 징후 모델 구현 강점",
        evaluationCriteria: [
          { criterion: "AI 모델 정확도", importance: "상", strategy: "Transformer 기반의 높은 시계열 모델 제시" },
          { criterion: "실시간 데이터 가용성", importance: "상", strategy: "분산 메시징 큐를 활용한 고효율 파이프라인 설계" }
        ],
        sections: [
          {
            sectionId: "sec-1",
            parentTitle: "제1장. 사업 개요 및 배경",
            subTitle: "1.1 제안 목적 및 배경",
            keyFocus: "센서 데이터 분석 플랫폼의 당위성 및 필요성 명시",
            estimatedPages: 10,
            estimatedWords: 2500,
            content: `# 1.1 제안 목적 및 배경

## 1. 추진 배경
- 본 사업은 인공지능 기반 스마트 공장 플랫폼 구축을 목표로 함.
- 기존의 레거시 설비 모니터링 방식에서 탈피하여 딥러닝 기반 남은 수명 예측(RUL)을 제공함.

## 2. 주요 연동 계획
- 스마트 팩토리 사물인터넷(IoT) 센서 데이터 실시간 가공 처리.

|구분|기존 방식|AI 예측 플랫폼|
|---|---|---|
|고장 사전 예방|불가능|가능 (LSTM 적용)|
|실시간 수집 속도|초당 100건|초당 10만 건 이상|
`,
            isDone: true
          },
          {
            sectionId: "sec-2",
            parentTitle: "제1장. 사업 개요 및 배경",
            subTitle: "1.2 사업 수행 범위",
            keyFocus: "사업 전반의 WBS 및 과업 요구사항 요약",
            estimatedPages: 15,
            estimatedWords: 3500,
            content: `# 1.2 사업 수행 범위

## 1. 과업 구성
- 대용량 시계열 분산 큐(Kafka) 설계 및 구현
- 스마트 공장 데이터 파이프라인 구축
- 2.0GHz 이상의 엣지 디바이스 지원
`,
            isDone: true
          }
        ]
      };
      setOutline(mockOutline);
      setCompanyName("제안기관");
      setProjectDuration("12개월");
      setWritingStyle("bullet");
      setSelectedSectionId("overview");
    }
  }, []);

  useEffect(() => {
    outlineRef.current = outline;
  }, [outline]);

  useEffect(() => {
    isBulkGeneratingRef.current = isBulkGenerating;
  }, [isBulkGenerating]);

  // Friendly error message utility for Gemini API and other server requests
  const getFriendlyErrorMessage = async (response: Response, defaultMessage: string): Promise<string> => {
    let serverMessage = "";
    try {
      const data = await response.json();
      if (data && data.error) {
        serverMessage = data.error;
      }
    } catch (_) {}

    const finalMsg = serverMessage || defaultMessage;
    const lowerMsg = finalMsg.toLowerCase();

    if (
      lowerMsg.includes("429") || 
      lowerMsg.includes("resource_exhausted") || 
      lowerMsg.includes("quota") || 
      lowerMsg.includes("limit") || 
      lowerMsg.includes("exceeded")
    ) {
      return `Gemini API 호출 제한을 초과했습니다 (429 Quota Exceeded/Resource Exhausted).\n\n[해결 방법]:\n우측 상단의 'Settings > Secrets' 메뉴(혹은 우측 설정 톱니바퀴)에서 본인의 'GEMINI_API_KEY'를 추가하시면 무료 일일 요청 한도 제한 없이 안정적으로 계속 이용하실 수 있습니다.\n\n(상세 원인: ${finalMsg})`;
    }
    return finalMsg;
  };

  // Fetch the initial outline based on RFP and custom template
  const handleAnalyzeRfp = async (config: {
    announcementText: string;
    rfpText: string;
    templateText: string;
    referenceText: string;
    companyName: string;
    projectDuration: string;
    writingStyle: string;
    customPrompt: string;
    targetPages: number;
  }) => {
    setIsLoadingOutline(true);
    setAnnouncementText(config.announcementText);
    setRfpText(config.rfpText);
    setTemplateText(config.templateText);
    setReferenceText(config.referenceText);
    setCompanyName(config.companyName);
    setProjectDuration(config.projectDuration);
    setWritingStyle(config.writingStyle);
    setRfpCustomPrompt(config.customPrompt);

    try {
      const response = await fetch("/api/analyze-rfp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcementText: config.announcementText,
          rfpText: config.rfpText,
          templateText: config.templateText,
          referenceText: config.referenceText,
          companyName: config.companyName,
          projectDuration: config.projectDuration,
          writingStyle: config.writingStyle,
          customPrompt: config.customPrompt,
          targetPages: config.targetPages,
        }),
      });

      if (!response.ok) {
        const friendlyError = await getFriendlyErrorMessage(response, "RFP 분석 도중 서버에서 오류가 발생했습니다.");
        throw new Error(friendlyError);
      }

      const data: ProposalOutline = await response.json();
      
      // Initialize state for sections
      const sectionsWithState = data.sections.map((sec) => ({
        ...sec,
        isDone: false,
        isGenerating: false,
      }));

      setOutline({
        ...data,
        sections: sectionsWithState,
      });
      setSelectedSectionId("overview");
    } catch (err: any) {
      alert(err.message || "오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoadingOutline(false);
    }
  };

  // Compile a single section with AI
  const handleGenerateSection = async (sectionId: string, rewriteInstructions: string = "") => {
    const currentOutline = outlineRef.current;
    if (!currentOutline) return false;

    const targetIndex = currentOutline.sections.findIndex((s) => s.sectionId === sectionId);
    if (targetIndex === -1) return false;

    // Set status to generating using functional state updater
    setOutline((prevOutline) => {
      if (!prevOutline) return null;
      const updatedSections = [...prevOutline.sections];
      const idx = updatedSections.findIndex((s) => s.sectionId === sectionId);
      if (idx !== -1) {
        updatedSections[idx] = {
          ...updatedSections[idx],
          isGenerating: true,
          error: undefined,
        };
      }
      return { ...prevOutline, sections: updatedSections };
    });

    try {
      const prevContext = currentOutline.sections
        .slice(0, targetIndex)
        .filter((s) => s.isDone)
        .map((s) => `[${s.subTitle} 핵심 내용]: ${s.content?.slice(0, 300)}...`)
        .join("\n\n");

      const sectionToGenerate = currentOutline.sections[targetIndex];

      const response = await fetch("/api/generate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId,
          parentTitle: sectionToGenerate.parentTitle,
          subTitle: sectionToGenerate.subTitle,
          keyFocus: rewriteInstructions 
            ? `${sectionToGenerate.keyFocus} (추가 지시사항: ${rewriteInstructions})`
            : sectionToGenerate.keyFocus,
          estimatedPages: sectionToGenerate.estimatedPages,
          announcementText,
          rfpText,
          templateText,
          referenceText,
          companyName,
          projectDuration,
          generatedContext: prevContext,
          writingStyle,
          customPrompt: rfpCustomPrompt,
        }),
      });

      if (!response.ok) {
        const friendlyError = await getFriendlyErrorMessage(response, "본문 생성에 실패하였습니다.");
        throw new Error(friendlyError);
      }

      const result = await response.json();
      
      setOutline((prevOutline) => {
        if (!prevOutline) return null;
        const nextSections = [...prevOutline.sections];
        const idx = nextSections.findIndex((s) => s.sectionId === sectionId);
        if (idx !== -1) {
          nextSections[idx] = {
            ...nextSections[idx],
            content: result.content,
            isGenerating: false,
            isDone: true,
          };
        }
        return { ...prevOutline, sections: nextSections };
      });
      
      // Update editing panel if the active section is the one that got updated
      if (selectedSectionId === sectionId) {
        setEditingContent(result.content);
      }
      return true;
    } catch (error: any) {
      setOutline((prevOutline) => {
        if (!prevOutline) return null;
        const nextSections = [...prevOutline.sections];
        const idx = nextSections.findIndex((s) => s.sectionId === sectionId);
        if (idx !== -1) {
          nextSections[idx] = {
            ...nextSections[idx],
            isGenerating: false,
            error: error.message || "오류 발생",
          };
        }
        return { ...prevOutline, sections: nextSections };
      });
      return false;
    }
  };

  // Bulk continuous compile loop
  useEffect(() => {
    if (!isBulkGenerating || !outline) return;
    if (isLoopRunningRef.current) return;
    
    const runBulk = async () => {
      isLoopRunningRef.current = true;
      
      while (isBulkGeneratingRef.current && outlineRef.current) {
        const currentOutline = outlineRef.current;
        const pendingIndex = currentOutline.sections.findIndex((s) => !s.isDone);
        
        if (pendingIndex !== -1) {
          setCurrentGeneratingIndex(pendingIndex);
          const success = await handleGenerateSection(currentOutline.sections[pendingIndex].sectionId);
          if (!success) {
            // Pause on error to let user inspect
            setIsBulkGenerating(false);
            break;
          }
          // Respect Gemini rate limits (max 5 requests per minute under free tier)
          // Add a 2 seconds delay between requests
          if (isBulkGeneratingRef.current) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        } else {
          // All sections completed!
          setIsBulkGenerating(false);
          setCurrentGeneratingIndex(-1);
          break;
        }
      }
      
      isLoopRunningRef.current = false;
    };

    runBulk();
  }, [isBulkGenerating, outline]);

  // Calculations for page scaling (memoized to avoid recalculation on every render)
  const totalTargetPages = useMemo(
    () => outline?.sections.reduce((sum, s) => sum + s.estimatedPages, 0) || 300,
    [outline?.sections]
  );
  const currentWrittenSections = useMemo(
    () => outline?.sections.filter(s => s.isDone) || [],
    [outline?.sections]
  );
  const currentWrittenPages = useMemo(
    () => outline?.sections.reduce((sum, s) => {
      if (s.isDone && s.content) {
        const characters = s.content.length;
        const calculatedPages = Math.max(2, Math.min(s.estimatedPages, Math.ceil(characters / 550)));
        return sum + calculatedPages;
      }
      return sum;
    }, 0) || 0,
    [outline?.sections]
  );

  const currentPercentage = useMemo(
    () => Math.round((currentWrittenPages / totalTargetPages) * 100),
    [currentWrittenPages, totalTargetPages]
  );

  // Render inline formatting (bold, code, italic)
  const renderInline = useCallback((text: string) => {
    const parts: React.ReactNode[] = [];
    // Match **bold**, `code`, *italic*
    const regex = /(\*\*(.+?)\*\*|`(.+?)`|\*(.+?)\*)/g;
    let lastIndex = 0;
    let match;
    let keyIdx = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      if (match[2]) {
        parts.push(<strong key={`b${keyIdx}`} className="font-bold text-slate-900">{match[2]}</strong>);
      } else if (match[3]) {
        parts.push(<code key={`c${keyIdx}`} className="bg-slate-100 text-indigo-700 px-1 py-0.5 rounded text-[11px] font-mono">{match[3]}</code>);
      } else if (match[4]) {
        parts.push(<em key={`i${keyIdx}`} className="italic">{match[4]}</em>);
      }
      lastIndex = match.index + match[0].length;
      keyIdx++;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  }, []);

  // Render markdown parser with block-level grouping (tables grouped correctly)
  const renderMarkdown = useCallback((text: string) => {
    if (!text) return <p className="text-slate-400 italic">본문 내용이 아직 작성되지 않았습니다. AI 생성을 시작하세요.</p>;

    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Markdown image
      const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        elements.push(
          <div key={i} className="my-4 flex flex-col items-center justify-center border border-indigo-100 rounded-xl p-3 bg-slate-50/50">
            <img
              src={imgMatch[2]}
              alt={imgMatch[1] || "AI generated diagram"}
              className="rounded-lg shadow-md max-w-full h-auto border border-slate-200 max-h-[350px] object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="text-[11px] text-slate-500 mt-2 font-medium flex items-center gap-1">
              <Image className="h-3.5 w-3.5 text-indigo-500" /> {imgMatch[1] || "AI 수석 작가 추천 기술 구조도 및 프로세스 맵"}
            </span>
          </div>
        );
        i++;
        continue;
      }

      // Headers
      if (line.startsWith("### ")) {
        elements.push(<h4 key={i} className="text-sm font-bold text-slate-800 pt-3 border-b border-slate-100 pb-1">{renderInline(line.slice(4))}</h4>);
        i++; continue;
      }
      if (line.startsWith("## ")) {
        elements.push(<h3 key={i} className="text-base font-extrabold text-indigo-900 pt-5 flex items-center gap-1.5"><BookMarked className="h-4.5 w-4.5 text-indigo-500" /> {renderInline(line.slice(3))}</h3>);
        i++; continue;
      }
      if (line.startsWith("# ")) {
        elements.push(<h2 key={i} className="text-lg font-black text-slate-900 pt-6 pb-2 border-b-2 border-indigo-100">{renderInline(line.slice(2))}</h2>);
        i++; continue;
      }

      // Blockquote
      if (trimmed.startsWith("> ")) {
        elements.push(
          <blockquote key={i} className="border-l-4 border-indigo-300 pl-4 py-1 text-slate-600 italic bg-indigo-50/30 rounded-r-lg">
            {renderInline(trimmed.slice(2))}
          </blockquote>
        );
        i++; continue;
      }

      // Numbered list
      if (/^\d+\.\s/.test(trimmed)) {
        elements.push(
          <li key={i} className="ml-4 list-decimal text-slate-700">
            {renderInline(trimmed.replace(/^\d+\.\s/, ""))}
          </li>
        );
        i++; continue;
      }

      // Bullets
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        elements.push(
          <li key={i} className="ml-4 list-disc text-slate-700">
            {renderInline(trimmed.substring(2))}
          </li>
        );
        i++; continue;
      }

      // Tables - group consecutive table rows into a single <table>
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        const tableStartIdx = i;
        const tableRows: { cells: string[]; isHeader: boolean; isSeparator: boolean }[] = [];

        while (i < lines.length) {
          const tl = lines[i].trim();
          if (!(tl.startsWith("|") && tl.endsWith("|"))) break;
          const isSep = /^[\|\s:\-]+$/.test(tl);
          const cells = tl.split("|").slice(1, -1).map(c => c.trim());
          tableRows.push({ cells, isHeader: false, isSeparator: isSep });
          i++;
        }

        // Mark first row as header if followed by a separator
        if (tableRows.length >= 2 && tableRows[1].isSeparator) {
          tableRows[0].isHeader = true;
        }

        const headerRow = tableRows.find(r => r.isHeader);
        const bodyRows = tableRows.filter(r => !r.isHeader && !r.isSeparator);

        elements.push(
          <div key={tableStartIdx} className="overflow-x-auto my-3">
            <table className="min-w-full divide-y divide-slate-200 border border-slate-200 text-xs">
              {headerRow && (
                <thead>
                  <tr className="bg-indigo-50 font-bold text-indigo-900">
                    {headerRow.cells.map((cell, cidx) => (
                      <th key={cidx} className="border border-slate-200 px-3 py-2.5 text-left">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-slate-100">
                {bodyRows.map((row, ridx) => (
                  <tr key={ridx} className="hover:bg-slate-50/50 transition-colors">
                    {row.cells.map((cell, cidx) => (
                      <td key={cidx} className="border border-slate-200 px-3 py-2 text-slate-700">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }

      // Empty line
      if (trimmed === "") {
        elements.push(<div key={i} className="h-2" />);
        i++; continue;
      }

      // Normal paragraph
      elements.push(<p key={i} className="text-slate-700 font-normal leading-relaxed text-justify">{renderInline(line)}</p>);
      i++;
    }

    return (
      <div className="prose prose-slate max-w-none text-xs md:text-sm leading-relaxed space-y-1">
        {elements}
      </div>
    );
  }, [renderInline]);

  // Trigger file download of all generated content
  const handleDownloadFullDoc = () => {
    if (!outline) return;

    let filename = `${companyName}_${outline.projectTitle.replace(/\s+/g, "_")}_사업계획서`;
    let content = "";
    let mimeType = "text/plain;charset=utf-8;";

    if (exportFormat === "md") {
      filename += ".md";
      mimeType = "text/markdown;charset=utf-8;";

      content = `# ${outline.projectTitle}\n\n`;
      content += `**제안 수행사**: ${companyName}\n`;
      content += `**사업 수행 기간**: ${projectDuration}\n`;
      content += `**전체 예상 기획 분량**: 300페이지 규모 표준 설계 준수\n\n`;
      content += `## 0. 프로젝트 핵심 요약\n${outline.projectGoal}\n\n`;
      content += `## 0.1 핵심 제안 전략\n${outline.companyStrengthRecommendation}\n\n`;

      outline.sections.forEach((sec) => {
        content += `\n\n# ${sec.parentTitle} - ${sec.subTitle}\n`;
        content += `*본문 기획 예상 배점 가중치: ${sec.estimatedPages} Pages*\n\n`;
        if (sec.content) {
          content += sec.content;
        } else {
          content += `*본 챕터 [${sec.subTitle}]는 설계 심층 가이드라인을 토대로 실무 기획 준비 중입니다.*\n`;
        }
      });
    }
    else if (exportFormat === "hwp" || exportFormat === "hwpx" || exportFormat === "doc") {
      const isHwpFamily = exportFormat === "hwp" || exportFormat === "hwpx";
      if (isHwpFamily) {
        filename += `_한글(${exportFormat.toUpperCase()})_불러오기용.html`;
        mimeType = "text/html;charset=utf-8;";
        alert(
          "안내: 한글(HWP/HWPX) 형식은 윈도우 한글 프로그램과의 서식 호환성을 100% 보장하기 위해 웹 표준 인터넷 문서(.html) 형식으로 안전하게 추출됩니다.\n\n" +
          "다운로드 완료 후 한글 프로그램에서 [파일] -> [불러오기](또는 [열기]) 메뉴를 통해 이 HTML 파일을 불러오시면 표와 서식이 깨짐 없이 완벽하게 자동 변환되어 로드됩니다."
        );
      } else {
        filename += `.${exportFormat}`;
        mimeType = "application/msword;charset=utf-8;";
      }

      // Dynamic highly-styled HTML markup that MS Word/Hancom HWPX load perfectly with styles & tables
      let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: "Malgun Gothic", "맑은 고딕", Arial, sans-serif; line-height: 1.8; margin: 40px; color: #1e293b; }
  h1 { font-size: 20pt; color: #1e3a8a; border-bottom: 3px solid #4f46e5; padding-bottom: 8px; margin-top: 35px; }
  h2 { font-size: 15pt; color: #312e81; margin-top: 25px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; }
  h3 { font-size: 12pt; color: #4338ca; margin-top: 18px; }
  p { font-size: 10pt; margin-bottom: 12px; text-align: justify; line-height: 1.8; }
  ul, ol { margin-bottom: 12px; padding-left: 20px; }
  li { font-size: 10pt; margin-bottom: 6px; color: #334155; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 9.5pt; }
  th, td { border: 1px solid #94a3b8; padding: 10px 12px; text-align: left; }
  th { background-color: #f1f5f9; font-weight: bold; color: #0f172a; }
  .cover { text-align: center; margin-top: 80px; margin-bottom: 120px; }
  .cover h1 { font-size: 28pt; border: none; margin-bottom: 40px; }
  .meta-box { border: 2px solid #e2e8f0; background-color: #f8fafc; padding: 25px; border-radius: 12px; margin-top: 50px; width: 80%; margin-left: auto; margin-right: auto; text-align: left; }
  .badge { display: inline-block; padding: 4px 10px; background-color: #e0e7ff; color: #4338ca; font-size: 9pt; font-weight: bold; border-radius: 6px; margin-bottom: 10px; }
</style>
</head>
<body>
  <div class="cover">
    <p style="font-size: 13pt; color: #4f46e5; font-weight: bold; letter-spacing: 2px;">BUSINESS PROPOSAL</p>
    <h1 style="color: #0f172a; font-weight: 900; line-height: 1.3;">${outline.projectTitle}</h1>
    
    <div class="meta-box">
      <p style="font-size: 11pt; margin-bottom: 8px;"><strong>• 제안사명:</strong> ${companyName}</p>
      <p style="font-size: 11pt; margin-bottom: 8px;"><strong>• 사업 수행 기간:</strong> ${projectDuration}</p>
      <p style="font-size: 11pt; margin-bottom: 8px;"><strong>• 문서 규격:</strong> 300페이지 대용량 실시간 집필 표준 가이드</p>
      <p style="font-size: 11pt; margin-bottom: 8px;"><strong>• 생성 일자:</strong> ${new Date().toLocaleDateString("ko-KR")}</p>
    </div>
  </div>
  
  <br style="page-break-before: always;" />

  <h2>0. 프로젝트 핵심 요약</h2>
  <p>${outline.projectGoal.replace(/\n/g, "<br>")}</p>
  
  <h2>0.1 핵심 제안 전략</h2>
  <p>${outline.companyStrengthRecommendation.replace(/\n/g, "<br>")}</p>
  `;

      outline.sections.forEach((sec) => {
        html += `<br style="page-break-before: always;" />`;
        html += `<h1>${sec.parentTitle} - ${sec.subTitle}</h1>`;
        html += `<div class="badge">설계 목표 분량: ${sec.estimatedPages} Pages</div>`;

        if (sec.content) {
          // Robust markdown conversion to HTML tags for Word
          let cleanContent = sec.content
            .replace(/### (.*)/g, "<h3>$1</h3>")
            .replace(/## (.*)/g, "<h2>$1</h2>")
            .replace(/# (.*)/g, "<h1>$1</h1>")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>");

          // Convert table blocks in markdown to HTML table
          const lines = cleanContent.split("\n");
          let inTable = false;
          let tableRows: string[] = [];
          const outputLines: string[] = [];

          lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
              if (trimmed.includes("---")) {
                // skip line
                return;
              }
              inTable = true;
              const cells = trimmed.split("|").filter((_, i, arr) => i > 0 && i < arr.length - 1);
              const isHeader = tableRows.length === 0;
              const rowHtml = `<tr>${cells.map(c => isHeader ? `<th>${c.trim()}</th>` : `<td>${c.trim()}</td>`).join("")}</tr>`;
              tableRows.push(rowHtml);
            } else {
              if (inTable) {
                outputLines.push(`<table>${tableRows.join("")}</table>`);
                tableRows = [];
                inTable = false;
              }
              
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                outputLines.push(`<li style="font-size: 10pt; color: #334155; margin-left: 15px;">${trimmed.substring(2)}</li>`);
              } else if (trimmed === "") {
                outputLines.push("<br>");
              } else {
                outputLines.push(`<p>${trimmed}</p>`);
              }
            }
          });

          if (inTable) {
            outputLines.push(`<table>${tableRows.join("")}</table>`);
          }

          html += `<div style="margin-top: 15px;">${outputLines.join("")}</div>`;
        } else {
          html += `<p style="color: #64748b; font-style: italic;">*본 챕터 [${sec.subTitle}]는 상세 가이드라인을 토대로 집필 진행 중인 섹션입니다.*</p>`;
        }
      });

      html += `</body></html>`;
      content = html;
    }
    else if (exportFormat === "txt") {
      filename += ".txt";
      mimeType = "text/plain;charset=utf-8;";

      content = `==================================================\n`;
      content += `   [사업계획서] ${outline.projectTitle}\n`;
      content += `==================================================\n\n`;
      content += `• 제안사명: ${companyName}\n`;
      content += `• 사업 수행 기간: ${projectDuration}\n`;
      content += `• 문서 규격: 300페이지 대용량 실시간 집필 표준 규격\n\n`;
      content += `--------------------------------------------------\n`;
      content += `0. 프로젝트 핵심 요약\n`;
      content += `--------------------------------------------------\n`;
      content += `${outline.projectGoal}\n\n`;
      content += `--------------------------------------------------\n`;
      content += `0.1 핵심 제안 전략\n`;
      content += `--------------------------------------------------\n`;
      content += `${outline.companyStrengthRecommendation}\n\n`;

      outline.sections.forEach((sec) => {
        content += `\n\n==================================================\n`;
        content += `[${sec.parentTitle}] ${sec.subTitle}\n`;
        content += `==================================================\n`;
        content += `* 목표 페이지 가중치: ${sec.estimatedPages} Pages\n\n`;
        if (sec.content) {
          content += sec.content;
        } else {
          content += `* 본 챕터는 집필 대기 상태입니다.\n`;
        }
      });
    }
    else if (exportFormat === "json") {
      filename += ".json";
      mimeType = "application/json;charset=utf-8;";
      content = JSON.stringify({
        projectTitle: outline.projectTitle,
        companyName,
        projectDuration,
        writingStyle,
        rfpCustomPrompt,
        projectGoal: outline.projectGoal,
        companyStrengthRecommendation: outline.companyStrengthRecommendation,
        evaluationCriteria: outline.evaluationCriteria,
        sections: outline.sections,
        announcementText,
        rfpText,
        templateText,
        referenceText
      }, null, 2);
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add custom custom section
  const handleAddCustomSection = () => {
    if (!outline || !newSectionSub || !newSectionParent) return;

    const newSec: ProposalSection = {
      sectionId: `custom-${Date.now()}`,
      parentTitle: newSectionParent,
      subTitle: newSectionSub,
      keyFocus: newSectionFocus || "RFP 요건 및 표준 사후 운영 방안 수립",
      estimatedPages: Number(newSectionPages),
      estimatedWords: Number(newSectionPages) * 250,
      isDone: false,
      isGenerating: false,
    };

    setOutline({
      ...outline,
      sections: [...outline.sections, newSec]
    });

    // Reset form
    setNewSectionParent("");
    setNewSectionSub("");
    setNewSectionFocus("");
    setNewSectionPages(15);
    setShowAddSection(false);
  };

  // Delete section
  const handleDeleteSection = (id: string) => {
    if (!outline) return;
    const nextSecs = outline.sections.filter(s => s.sectionId !== id);
    setOutline({
      ...outline,
      sections: nextSecs
    });
    if (selectedSectionId === id) {
      setSelectedSectionId("overview");
    }
  };

  // Custom modification rewrite command handler
  const handleCustomRewrite = async () => {
    if (!outline || selectedSectionId === "overview" || selectedSectionId === "all") return;
    setIsCustomPromoting(true);
    await handleGenerateSection(selectedSectionId as string, customPrompt);
    setCustomPrompt("");
    setIsCustomPromoting(false);
  };

  // Live save active content edits
  const handleSaveTextEdit = () => {
    if (!outline || selectedSectionId === "overview" || selectedSectionId === "all") return;
    const nextSections = [...outline.sections];
    const idx = nextSections.findIndex(s => s.sectionId === selectedSectionId);
    if (idx !== -1) {
      nextSections[idx].content = editingContent;
      nextSections[idx].isDone = true;
    }
    setOutline({ ...outline, sections: nextSections });
    setIsEditingMode(false);
  };

  // AI Diagram Generation Handler
  const handleGenerateDiagram = async () => {
    if (!diagramPrompt.trim()) return;
    setIsGeneratingDiagram(true);
    setDiagramError(null);
    setGeneratedDiagramUrl(null);

    try {
      const response = await fetch("/api/generate-diagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: diagramPrompt,
          style: diagramStyle,
          aspectRatio: diagramAspectRatio,
        }),
      });

      if (!response.ok) {
        const friendlyError = await getFriendlyErrorMessage(response, "서버 연동 도중 오류가 발생했습니다.");
        throw new Error(friendlyError);
      }

      const data = await response.json();
      if (data.success) {
        setGeneratedDiagramUrl(data.imageUrl);
      } else {
        // Fallback occurred
        setGeneratedDiagramUrl(data.imageUrl);
        setDiagramError("이미지 생성이 대기 중이거나 한도 초과 상태입니다. 실무 참고용 임시 시뮬레이션 다이어그램을 출력합니다.");
      }
    } catch (err: any) {
      setDiagramError(err.message || "이미지 생성 도중 알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsGeneratingDiagram(false);
    }
  };

  // Insert generated diagram markdown image into document body
  const handleInsertDiagram = () => {
    if (!generatedDiagramUrl || !outline || !diagramSectionId) return;

    const nextSections = [...outline.sections];
    const idx = nextSections.findIndex(s => s.sectionId === diagramSectionId);
    if (idx !== -1) {
      const currentContent = nextSections[idx].content || "";
      const imageMarkdown = `\n\n![${diagramPrompt}](${generatedDiagramUrl})\n\n`;
      const newContent = currentContent + imageMarkdown;

      nextSections[idx].content = newContent;
      nextSections[idx].isDone = true;

      setOutline({ ...outline, sections: nextSections });
      if (selectedSectionId === diagramSectionId) {
        setEditingContent(newContent);
      }
    }

    // Reset and close modal
    setShowDiagramModal(false);
    setDiagramPrompt("");
    setGeneratedDiagramUrl(null);
    setDiagramError(null);
  };

  // Trigger Overall Document Consistency Check
  const handleCheckConsistency = async () => {
    if (!outline) return;
    setIsCheckingConsistency(true);
    setConsistencyError(null);
    setConsistencyResults(null);
    setConsistencyScore(null);
    setShowConsistencyModal(true);

    try {
      const response = await fetch("/api/check-consistency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          projectDuration,
          writingStyle,
          sections: outline.sections,
          projectGoal: outline.projectGoal,
          companyStrengthRecommendation: outline.companyStrengthRecommendation
        }),
      });

      if (!response.ok) {
        const friendlyError = await getFriendlyErrorMessage(response, "정합성 진단 도중 서버 에러가 발생했습니다.");
        throw new Error(friendlyError);
      }

      const data = await response.json();
      setConsistencyResults(data.results);
      setConsistencyScore(data.score);
    } catch (err: any) {
      setConsistencyError(err.message || "서버 통신 실패");
    } finally {
      setIsCheckingConsistency(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      <Header
        title={outline?.projectTitle}
        hasOutline={!!outline}
        onReset={() => {
          setOutline(null);
          setSelectedSectionId("overview");
        }}
        isBulkGenerating={isBulkGenerating}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!outline ? (
          /* Form screen when no outline yet */
          isLoadingOutline ? (
            <div className="flex flex-col items-center justify-center min-h-[450px] space-y-6 text-center animate-pulse">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-75"></div>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg">
                  <Cpu className="h-8 w-8 animate-spin" />
                </div>
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-lg font-extrabold text-slate-800">
                  AI 제안서 마스터 엔진 가동 중...
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  업로드된 공고문(RFP)과 목차 템플릿의 문맥적 일치도를 검증하고 고해상도 대용량 사업계획서 목차 프레임워크를 조율하는 단계입니다. 약 5~15초 정도 소요됩니다.
                </p>
              </div>
              
              <div className="w-full max-w-xs bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-1.5 w-1/3 animate-pulse rounded-full"></div>
              </div>
            </div>
          ) : (
            <RfpInputForm 
              onAnalyze={handleAnalyzeRfp} 
              isLoading={isLoadingOutline} 
              onImportBackup={(backupData) => {
                setOutline(backupData);
                if (backupData.companyName) setCompanyName(backupData.companyName);
                if (backupData.projectDuration) setProjectDuration(backupData.projectDuration);
                if (backupData.writingStyle) setWritingStyle(backupData.writingStyle);
                if (backupData.rfpCustomPrompt) setRfpCustomPrompt(backupData.rfpCustomPrompt);
                if (backupData.announcementText) setAnnouncementText(backupData.announcementText);
                if (backupData.rfpText) setRfpText(backupData.rfpText);
                if (backupData.templateText) setTemplateText(backupData.templateText);
                if (backupData.referenceText) setReferenceText(backupData.referenceText);
                setSelectedSectionId("overview");
              }}
            />
          )
        ) : (
          /* Interactive Document Builder Workspace */
          <div className="space-y-6 animate-fade-in">
            {/* Top Bulk Progress Dashboard Banner */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-indigo-600" />
                    <span>300페이지 대용량 실시간 집필 컴파일러</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    각 섹션의 완성도와 비즈니스 수치를 반영하여 표준 인쇄물 기준의 실시간 기획 페이지 분량이 자동 집계됩니다.
                  </p>
                </div>
                {/* Compiler controls */}
                <div className="flex items-center gap-2">
                  {isBulkGenerating ? (
                    <button
                      onClick={() => setIsBulkGenerating(false)}
                      className="inline-flex items-center space-x-1 px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-amber-700 transition"
                    >
                      <Pause className="h-3.5 w-3.5" />
                      <span>자동 집필 일시중지</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsBulkGenerating(true);
                        // Trigger next
                        setCurrentGeneratingIndex(-1);
                      }}
                      className="inline-flex items-center space-x-1 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition hover:scale-[1.02]"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>전체 챕터 자동 연속 집필 시작</span>
                    </button>
                  )}

                  <button
                    onClick={handleCheckConsistency}
                    disabled={currentWrittenSections.length === 0}
                    className={`inline-flex items-center space-x-1 px-4 py-2 text-xs font-bold rounded-lg border transition hover:scale-[1.02] cursor-pointer ${
                      currentWrittenSections.length === 0
                        ? "bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>전체 문서 정합성 체크</span>
                  </button>

                  <div className="flex items-center space-x-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value as any)}
                      className="text-xs bg-transparent border-0 focus:outline-none focus:ring-0 pr-6 pl-2 py-1 font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value="md">마크다운 (.md)</option>
                      <option value="hwp">한글 HWP (.hwp)</option>
                      <option value="hwpx">한글 HWPX (.hwpx)</option>
                      <option value="doc">MS Word (.doc)</option>
                      <option value="txt">일반 텍스트 (.txt)</option>
                      <option value="json">기획안 백업 (.json)</option>
                    </select>

                    <button
                      onClick={handleDownloadFullDoc}
                      disabled={currentWrittenSections.length === 0}
                      className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-extrabold rounded-md transition cursor-pointer ${
                        currentWrittenSections.length === 0
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                      }`}
                    >
                      <Download className="h-3 w-3" />
                      <span>추출</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress metrics */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <span>집필 진행률:</span>
                    <span className="font-bold text-slate-800">
                      {currentWrittenSections.length} / {outline.sections.length} 챕터 완료
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600">인쇄 표준 예상 분량:</span>
                    <span className="font-bold text-indigo-600 animate-pulse">
                      {currentWrittenPages} / {totalTargetPages} 페이지 확보
                    </span>
                  </div>
                </div>

                <div className="relative w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/50">
                  <div
                    className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${currentPercentage}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>기획 준비 단계</span>
                  <span>100P 확보</span>
                  <span>200P 도달</span>
                  <span className="font-semibold text-indigo-500">최종 300P 표준 달성</span>
                </div>
              </div>
            </div>

            {/* Split Screen Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Panel - Navigator (35%) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col max-h-[700px]">
                  {/* Panel Header */}
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <ListOrdered className="h-4 w-4" /> 기획 설계 목차 목록
                    </h3>
                    <button
                      onClick={() => setShowAddSection(!showAddSection)}
                      className="text-xs text-indigo-600 font-bold flex items-center gap-0.5 hover:underline"
                    >
                      <Plus className="h-3 w-3" /> 항목 추가
                    </button>
                  </div>

                  {/* Add section mini form */}
                  {showAddSection && (
                    <div className="p-4 bg-indigo-50/50 border-b border-slate-200 space-y-3 shrink-0 animate-fade-in">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">대분류명</label>
                          <input
                            type="text"
                            value={newSectionParent}
                            onChange={(e) => setNewSectionParent(e.target.value)}
                            placeholder="예: I. 개요"
                            className="w-full text-xs rounded border border-slate-300 bg-white px-2 py-1 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">세부 챕터명</label>
                          <input
                            type="text"
                            value={newSectionSub}
                            onChange={(e) => setNewSectionSub(e.target.value)}
                            placeholder="예: 1.1 배경"
                            className="w-full text-xs rounded border border-slate-300 bg-white px-2 py-1 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">RFP 핵심 집필 가이드</label>
                        <textarea
                          value={newSectionFocus}
                          onChange={(e) => setNewSectionFocus(e.target.value)}
                          placeholder="작성 기준 요건 기술"
                          rows={2}
                          className="w-full text-xs rounded border border-slate-300 bg-white px-2 py-1 focus:outline-none resize-none"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1">
                          <label className="text-[10px] font-bold text-slate-500">배정 페이지 수:</label>
                          <input
                            type="number"
                            value={newSectionPages}
                            onChange={(e) => setNewSectionPages(Number(e.target.value))}
                            className="w-12 text-xs rounded border border-slate-300 bg-white px-1.5 py-0.5 text-center focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setShowAddSection(false)}
                            className="text-[10px] text-slate-500 bg-white px-2.5 py-1 rounded border border-slate-200"
                          >
                            취소
                          </button>
                          <button
                            onClick={handleAddCustomSection}
                            className="text-[10px] text-white bg-indigo-600 px-2.5 py-1 rounded"
                          >
                            추가 확정
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* List items */}
                  <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
                    {/* Fixed Overview & Complete stats button */}
                    <button
                      onClick={() => setSelectedSectionId("overview")}
                      className={`w-full text-left p-4 transition-all flex items-center justify-between ${
                        selectedSectionId === "overview"
                          ? "bg-indigo-50/50 border-l-4 border-indigo-600 font-bold"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs text-slate-500 block">수행 공략 분석 및 전략</span>
                        <span className="text-xs font-bold text-slate-800">제안서 기획 개요 및 평가 Matrix</span>
                      </div>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold shrink-0">
                        종합 요약
                      </span>
                    </button>

                    {/* Dynamic Sections mapped from Outline */}
                    {outline.sections.map((sec, idx) => {
                      const isSelected = selectedSectionId === sec.sectionId;
                      return (
                        <div
                          key={sec.sectionId}
                          className={`group relative flex items-stretch border-l-4 transition-all ${
                            isSelected
                              ? "bg-indigo-50/30 border-indigo-600"
                              : "border-transparent hover:bg-slate-50/50"
                          }`}
                        >
                          <button
                            onClick={() => {
                              setSelectedSectionId(sec.sectionId);
                              setEditingContent(sec.content || "");
                              setIsEditingMode(false);
                            }}
                            className="flex-1 text-left p-4 space-y-1 focus:outline-none"
                          >
                            <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase block">
                              {sec.parentTitle}
                            </span>
                            <span className="text-xs font-bold text-slate-800 block line-clamp-1 leading-tight">
                              {sec.subTitle}
                            </span>
                            
                            {/* Tags under title */}
                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                              <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium shrink-0">
                                목표 {sec.estimatedPages}P ({sec.estimatedWords}자)
                              </span>
                              {sec.isDone && (
                                <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 font-bold shrink-0">
                                  집필 완료 ({Math.ceil(sec.content?.length || 0)}자)
                                </span>
                              )}
                              {sec.isGenerating && (
                                <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-100 font-bold shrink-0 animate-pulse flex items-center gap-0.5">
                                  <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-ping"></span>
                                  집필 중...
                                </span>
                              )}
                              {sec.error && (
                                <span className="text-[9px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-100 font-semibold shrink-0">
                                  오류 발생
                                </span>
                              )}
                            </div>
                          </button>

                          {/* Action controls for section */}
                          <div className="opacity-0 group-hover:opacity-100 flex items-center pr-3 space-x-1 shrink-0 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateSection(sec.sectionId);
                              }}
                              disabled={sec.isGenerating || isBulkGenerating}
                              title="이 장만 생성/재생성"
                              className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-indigo-600 disabled:opacity-40 transition"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSection(sec.sectionId);
                              }}
                              disabled={sec.isGenerating || isBulkGenerating}
                              title="삭제"
                              className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 disabled:opacity-40 transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Left Side Info Panel */}
                <div className="bg-slate-800 text-white rounded-2xl p-4 space-y-3 shadow-md">
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <Info className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">용어 해설 및 분량 산정</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    본 시스템은 <strong>Gemini 2.5</strong> 모델을 사용해 심층 비즈니스 한국어 컴파일을 진행합니다. 
                    각 목차별 배정된 기획 페이지 부피는 실제 관공서 및 공공 사업계획서 제출 규격을 반영하여 산정되었으며, 
                    전체 목차가 일괄 완성되면 표준 300페이지 규모에 합치하도록 설계되었습니다.
                  </p>
                </div>
              </div>

              {/* Right Panel - Active Content Editor/Previewer (65%) */}
              <div className="lg:col-span-8 space-y-4">
                {selectedSectionId === "overview" ? (
                  /* Overview dashboard state */
                  <OverviewDashboard outline={outline} companyName={companyName} />
                ) : (
                  /* Section Details View & Edit State */
                  (() => {
                    const activeSection = outline.sections.find(s => s.sectionId === selectedSectionId);
                    if (!activeSection) return null;

                    return (
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[550px]">
                        {/* Header of workspace */}
                        <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                          <div>
                            <span className="text-[10px] font-bold text-indigo-600 block uppercase tracking-wider">
                              {activeSection.parentTitle}
                            </span>
                            <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                              {activeSection.subTitle}
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            {activeSection.content && (
                              <button
                                onClick={() => {
                                  setDiagramSectionId(activeSection.sectionId);
                                  setDiagramPrompt(`${activeSection.subTitle} 기술 구조도 및 상세 아키텍처 프로세스 다이어그램`);
                                  setGeneratedDiagramUrl(null);
                                  setDiagramError(null);
                                  setShowDiagramModal(true);
                                }}
                                className="inline-flex items-center space-x-1 rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 px-3 py-1.5 text-xs font-bold shadow-sm transition hover:bg-indigo-100"
                              >
                                <Image className="h-3.5 w-3.5 text-indigo-600" />
                                <span>AI 다이어그램 생성</span>
                              </button>
                            )}

                            {activeSection.content && (
                              <button
                                onClick={() => {
                                  if (isEditingMode) {
                                    handleSaveTextEdit();
                                  } else {
                                    setEditingContent(activeSection.content || "");
                                    setIsEditingMode(true);
                                  }
                                }}
                                className="inline-flex items-center space-x-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                <span>{isEditingMode ? "편집 완료 및 저장" : "직접 본문 편집"}</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleGenerateSection(activeSection.sectionId)}
                              disabled={activeSection.isGenerating || isBulkGenerating}
                              className="inline-flex items-center space-x-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-40"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>{activeSection.content ? "다시 집필" : "이 챕터 기획서 작성 시작"}</span>
                            </button>
                          </div>
                        </div>

                        {/* Focus details summary banner */}
                        <div className="bg-indigo-50/40 p-4 border-b border-slate-200 text-xs text-slate-700 space-y-1.5">
                          <span className="font-bold text-indigo-900 block flex items-center gap-1">
                            <Sliders className="h-3.5 w-3.5 text-indigo-500" />
                            <span>심사 기준 및 기획 중점 사항 (RFP 의무 사항)</span>
                          </span>
                          <p className="leading-relaxed text-slate-600">
                            {activeSection.keyFocus}
                          </p>
                        </div>

                        {/* Main workspace container */}
                        <div className="flex-1 p-6 overflow-y-auto max-h-[500px]">
                          {activeSection.isGenerating ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                              <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <div className="text-center">
                                <p className="text-xs font-bold text-slate-800">Gemini 2.5 AI 수석 작가가 본문을 집필하고 있습니다...</p>
                                <p className="text-[10px] text-slate-500">실시간 WBS 구조 보정, 기술 비교 테이블 및 가상의 데이터 생성 알고리즘이 적용 중입니다.</p>
                              </div>
                            </div>
                          ) : isEditingMode ? (
                            <textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="w-full h-full min-h-[350px] p-4 font-mono text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 resize-y leading-relaxed"
                            />
                          ) : (
                            renderMarkdown(activeSection.content || "")
                          )}
                        </div>

                        {/* Interactive prompt-based fine-tuning block */}
                        {activeSection.content && !activeSection.isGenerating && (
                          <div className="p-4 bg-slate-50 border-t border-slate-200">
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-indigo-600 animate-pulse" />
                                <span>인공지능 피드백 보정 (예: "여기에 비용 상세 분석표를 더해줘", "소프트웨어 아키텍처 항목을 더 상세히 작성해줘")</span>
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={customPrompt}
                                  onChange={(e) => setCustomPrompt(e.target.value)}
                                  placeholder="AI에게 기획안 보정 또는 특정 내용 추가를 지시하세요..."
                                  className="flex-1 text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !isCustomPromoting && customPrompt.trim()) {
                                      handleCustomRewrite();
                                    }
                                  }}
                                />
                                <button
                                  onClick={handleCustomRewrite}
                                  disabled={isCustomPromoting || !customPrompt.trim()}
                                  className="inline-flex items-center space-x-1 rounded-lg bg-slate-800 text-white px-3 py-2 text-xs font-bold hover:bg-slate-950 transition disabled:opacity-40"
                                >
                                  {isCustomPromoting ? (
                                    <span className="animate-spin h-3 w-3 border-2 border-white rounded-full"></span>
                                  ) : (
                                    <Send className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 🎨 AI Diagram Generator Modal */}
      {showDiagramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
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
                onClick={() => setShowDiagramModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> 도식화 세부 설명 입력 (한글)
                </label>
                <textarea
                  value={diagramPrompt}
                  onChange={(e) => setDiagramPrompt(e.target.value)}
                  placeholder="예: 클라우드 컨테이너 분산 아키텍처 (VPC, API Gateway, Microservices 구조 및 이중화 흐름도)"
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-mono"
                />
                
                {/* Prompt suggestion triggers */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 self-center">추천 템플릿:</span>
                  <button
                    onClick={() => setDiagramPrompt("하이브리드 클라우드 물리/상태 정보 보안 연동 시스템 아키텍처 흐름도")}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full transition"
                  >
                    #보안망구성도
                  </button>
                  <button
                    onClick={() => setDiagramPrompt("3단 레이어 분산 처리 데이터 수집 파이프라인 (Kafka, Spark, NoSQL)")}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full transition"
                  >
                    #데이터처리도
                  </button>
                  <button
                    onClick={() => setDiagramPrompt("실시간 무중단 마이그레이션 백업 및 장애 대응 전환 시스템 시퀀스 맵")}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full transition"
                  >
                    #이중화시퀀스
                  </button>
                </div>
              </div>

              {/* Configurations */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">다이어그램 렌더링 스타일</label>
                  <select
                    value={diagramStyle}
                    onChange={(e: any) => setDiagramStyle(e.target.value)}
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
                    value={diagramAspectRatio}
                    onChange={(e: any) => setDiagramAspectRatio(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="16:9">와이드 가로형 (16:9)</option>
                    <option value="4:3">표준 가로형 (4:3)</option>
                  </select>
                </div>
              </div>

              {/* Status and Output preview panel */}
              <div className="border border-slate-200 rounded-2xl bg-slate-50/50 p-4 min-h-[220px] flex flex-col items-center justify-center relative overflow-hidden">
                {isGeneratingDiagram ? (
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
                ) : generatedDiagramUrl ? (
                  <div className="space-y-3 w-full text-center">
                    <img 
                      src={generatedDiagramUrl} 
                      alt="AI generated technical blueprint diagram" 
                      className="rounded-xl shadow-md border border-slate-200 max-h-[180px] mx-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                    {diagramError && (
                      <p className="text-[10px] text-amber-600 text-center bg-amber-50 p-1.5 rounded border border-amber-100 font-medium leading-relaxed">
                        ⚠️ 알림: {diagramError}
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

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-indigo-600 font-bold">
                💡 인쇄물에 바로 결합할 수 있는 고해상도 이미지 포맷 대응
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDiagramModal(false)}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  취소
                </button>
                {!generatedDiagramUrl ? (
                  <button
                    onClick={handleGenerateDiagram}
                    disabled={isGeneratingDiagram || !diagramPrompt.trim()}
                    className="inline-flex items-center space-x-1 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-40"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI 이미지 생성</span>
                  </button>
                ) : (
                  <button
                    onClick={handleInsertDiagram}
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
      )}

      {/* 🔍 Document Consistency Checker Modal */}
      {showConsistencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
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
                onClick={() => setShowConsistencyModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
              {isCheckingConsistency ? (
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
              ) : consistencyError ? (
                <div className="p-6 border border-rose-100 rounded-xl bg-rose-50/50 flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-rose-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-800">점검 오류 발생</h4>
                    <p className="text-[10px] text-rose-600">{consistencyError}</p>
                    <button
                      onClick={handleCheckConsistency}
                      className="mt-2 text-[10px] font-bold text-indigo-600 hover:underline"
                    >
                      다시 정합성 체크 실행하기
                    </button>
                  </div>
                </div>
              ) : consistencyResults ? (
                <div className="space-y-6">
                  {/* Score overview board */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      {/* Gauge circle or big number */}
                      <div className="relative h-16 w-16 flex items-center justify-center rounded-full bg-slate-50 border-4 border-indigo-500 shadow-inner">
                        <span className="text-lg font-black text-slate-800">{consistencyScore}</span>
                        <span className="text-[9px] text-slate-500 absolute bottom-1">점</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800">문서 정합성 신뢰 지수</h4>
                        <p className="text-[10px] text-slate-500">
                          {consistencyScore && consistencyScore >= 90 ? "★ 최우수 - 즉시 조달청 및 고객사 제출 가능 품질" :
                           consistencyScore && consistencyScore >= 70 ? "☆ 양호 - 미세한 키워드 불일치 교정 권장" :
                           "⚠️ 보완 필요 - 핵심 기간 수치 모순 또는 미작성 항목 대량 발견"}
                        </p>
                      </div>
                    </div>
                    {/* Overall Summary Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center shrink-0">
                      <div className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                        <span className="block text-[10px] text-emerald-800 font-bold">오류 없음</span>
                        <span className="text-xs font-extrabold text-emerald-600">
                          {consistencyResults.filter(r => r.type === "success").length}건
                        </span>
                      </div>
                      <div className="bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
                        <span className="block text-[10px] text-amber-800 font-bold">주의 검토</span>
                        <span className="text-xs font-extrabold text-amber-600">
                          {consistencyResults.filter(r => r.type === "warning").length}건
                        </span>
                      </div>
                      <div className="bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl">
                        <span className="block text-[10px] text-rose-800 font-bold">치명적 모순</span>
                        <span className="text-xs font-extrabold text-rose-600">
                          {consistencyResults.filter(r => r.type === "error").length}건
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Results List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-700">전수 교차 감리 정밀 진단서</h4>
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                      {consistencyResults.map((result, index) => (
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

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => setShowConsistencyModal(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                닫기
              </button>
              <button
                onClick={handleCheckConsistency}
                className="inline-flex items-center space-x-1 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>재점검 수행</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
