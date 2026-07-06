import React, { useState, useMemo } from "react";
import {
  Layers, Play, Pause, ShieldCheck, Download, ListOrdered, Plus, Info, Image, Edit2, Sparkles, Send, RefreshCw, Trash2
} from "lucide-react";
import { Cpu } from "lucide-react";

import Header from "./components/Header";
import RfpInputForm from "./components/RfpInputForm";
import OverviewDashboard from "./components/OverviewDashboard";
import { ProposalSection } from "./types";

import { useProposalState } from "./hooks/useProposalState";
import { useBulkGeneration } from "./hooks/useBulkGeneration";
import { useDiagram } from "./hooks/useDiagram";
import { useConsistency } from "./hooks/useConsistency";
import { DiagramModal } from "./components/DiagramModal";
import { ConsistencyModal } from "./components/ConsistencyModal";
import { getFriendlyErrorMessage, renderMarkdown } from "./utils";

export default function App() {
  const {
    announcementText, setAnnouncementText,
    rfpText, setRfpText,
    templateText, setTemplateText,
    referenceText, setReferenceText,
    companyName, setCompanyName,
    projectDuration, setProjectDuration,
    writingStyle, setWritingStyle,
    rfpCustomPrompt, setRfpCustomPrompt,
    isLoadingOutline,
    outline, setOutline,
    selectedSectionId, setSelectedSectionId,
    handleAnalyzeRfp,
    handleGenerateSection
  } = useProposalState(getFriendlyErrorMessage);

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
  const [customPrompt, setCustomPrompt] = useState("");
  const [isCustomPromoting, setIsCustomPromoting] = useState(false);

  const {
    isBulkGenerating,
    setIsBulkGenerating,
    setCurrentGeneratingIndex,
  } = useBulkGeneration(
    outline, 
    (sectionId) => handleGenerateSection(sectionId, "", setEditingContent)
  );

  const diagram = useDiagram(
    outline, setOutline, selectedSectionId, setEditingContent, getFriendlyErrorMessage
  );

  const consistency = useConsistency(
    outline, companyName, projectDuration, writingStyle, getFriendlyErrorMessage
  );

  // Calculations for page scaling
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

  // Trigger file download
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
          let cleanContent = sec.content
            .replace(/### (.*)/g, "<h3>$1</h3>")
            .replace(/## (.*)/g, "<h2>$1</h2>")
            .replace(/# (.*)/g, "<h1>$1</h1>")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>");

          const lines = cleanContent.split("\n");
          let inTable = false;
          let tableRows: string[] = [];
          const outputLines: string[] = [];

          lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
              if (trimmed.includes("---")) return;
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

    setNewSectionParent("");
    setNewSectionSub("");
    setNewSectionFocus("");
    setNewSectionPages(15);
    setShowAddSection(false);
  };

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

  const handleCustomRewrite = async () => {
    if (!outline || selectedSectionId === "overview" || selectedSectionId === "all") return;
    setIsCustomPromoting(true);
    await handleGenerateSection(selectedSectionId as string, customPrompt, setEditingContent);
    setCustomPrompt("");
    setIsCustomPromoting(false);
  };

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
                        setCurrentGeneratingIndex(-1);
                      }}
                      className="inline-flex items-center space-x-1 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition hover:scale-[1.02]"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>전체 챕터 자동 연속 집필 시작</span>
                    </button>
                  )}

                  <button
                    onClick={consistency.handleCheckConsistency}
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

                    {outline.sections.map((sec) => {
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

                          <div className="opacity-0 group-hover:opacity-100 flex items-center pr-3 space-x-1 shrink-0 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateSection(sec.sectionId, "", setEditingContent);
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
                  <OverviewDashboard outline={outline} companyName={companyName} />
                ) : (
                  (() => {
                    const activeSection = outline.sections.find(s => s.sectionId === selectedSectionId);
                    if (!activeSection) return null;

                    return (
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[550px]">
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
                                  diagram.setDiagramSectionId(activeSection.sectionId);
                                  diagram.setDiagramPrompt(`${activeSection.subTitle} 기술 구조도 및 상세 아키텍처 프로세스 다이어그램`);
                                  diagram.setShowDiagramModal(true);
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
                              onClick={() => handleGenerateSection(activeSection.sectionId, "", setEditingContent)}
                              disabled={activeSection.isGenerating || isBulkGenerating}
                              className="inline-flex items-center space-x-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-40"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>{activeSection.content ? "다시 집필" : "이 챕터 기획서 작성 시작"}</span>
                            </button>
                          </div>
                        </div>

                        <div className="bg-indigo-50/40 p-4 border-b border-slate-200 text-xs text-slate-700 space-y-1.5">
                          <span className="font-bold text-indigo-900 block flex items-center gap-1">
                            {/* Icon skipped to simplify */}
                            <span>심사 기준 및 기획 중점 사항 (RFP 의무 사항)</span>
                          </span>
                          <p className="leading-relaxed text-slate-600">
                            {activeSection.keyFocus}
                          </p>
                        </div>

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

                        {activeSection.content && !activeSection.isGenerating && (
                          <div className="p-4 bg-slate-50 border-t border-slate-200">
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-indigo-600 animate-pulse" />
                                <span>인공지능 피드백 보정 (예: "여기에 비용 상세 분석표를 더해줘")</span>
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

      <DiagramModal 
        show={diagram.showDiagramModal}
        onClose={() => diagram.setShowDiagramModal(false)}
        prompt={diagram.diagramPrompt}
        setPrompt={diagram.setDiagramPrompt}
        style={diagram.diagramStyle}
        setStyle={diagram.setDiagramStyle}
        aspectRatio={diagram.diagramAspectRatio}
        setAspectRatio={diagram.setDiagramAspectRatio}
        isGenerating={diagram.isGeneratingDiagram}
        generatedUrl={diagram.generatedDiagramUrl}
        error={diagram.diagramError}
        onGenerate={diagram.handleGenerateDiagram}
        onInsert={diagram.handleInsertDiagram}
      />

      <ConsistencyModal 
        show={consistency.showConsistencyModal}
        onClose={() => consistency.setShowConsistencyModal(false)}
        isChecking={consistency.isCheckingConsistency}
        error={consistency.consistencyError}
        results={consistency.consistencyResults}
        score={consistency.consistencyScore}
        companyName={companyName}
        projectDuration={projectDuration}
        onCheck={consistency.handleCheckConsistency}
      />
    </div>
  );
}
