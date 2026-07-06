import React, { useState } from "react";
import { ProposalOutline } from "../types";
import { fetchApiKey, clientGenerateDiagram } from "../utils/geminiClient";

export function useDiagram(
  outline: ProposalOutline | null,
  setOutline: React.Dispatch<React.SetStateAction<ProposalOutline | null>>,
  selectedSectionId: string | "overview" | "all",
  setEditingContent: (content: string) => void,
  getFriendlyErrorMessage: (response: Response, defaultMessage: string) => Promise<string>
) {
  const [showDiagramModal, setShowDiagramModal] = useState(false);
  const [diagramSectionId, setDiagramSectionId] = useState("");
  const [diagramPrompt, setDiagramPrompt] = useState("");
  const [diagramStyle, setDiagramStyle] = useState<"isometric" | "flat" | "blueprint" | "infographic">("isometric");
  const [diagramAspectRatio, setDiagramAspectRatio] = useState<"16:9" | "4:3">("16:9");
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false);
  const [generatedDiagramUrl, setGeneratedDiagramUrl] = useState<string | null>(null);
  const [diagramError, setDiagramError] = useState<string | null>(null);

  async function runServerDiagram(): Promise<any> {
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

    return await response.json();
  }

  const handleGenerateDiagram = async () => {
    if (!diagramPrompt.trim()) return;
    setIsGeneratingDiagram(true);
    setDiagramError(null);
    setGeneratedDiagramUrl(null);

    try {
      const apiKey = await fetchApiKey();
      if (!apiKey) {
        throw new Error("Gemini API Key가 설정되지 않았습니다. 우측 상단의 설정(톱니바퀴) 아이콘을 눌러 API Key를 등록하거나 Vercel 환경 변수를 설정해주세요.");
      }

      let data;
      try {
        console.log("[useDiagram] Running client-side diagram generation...");
        data = await clientGenerateDiagram(apiKey, {
          prompt: diagramPrompt,
          style: diagramStyle,
          aspectRatio: diagramAspectRatio
        });
      } catch (clientErr: any) {
        console.warn("[useDiagram] Client-side diagram generation failed, falling back to server:", clientErr);
        data = await runServerDiagram();
      }

      if (data) {
        if (data.success) {
          setGeneratedDiagramUrl(data.imageUrl);
        } else {
          setGeneratedDiagramUrl(data.imageUrl);
          setDiagramError("이미지 생성이 대기 중이거나 한도 초과 상태입니다. 실무 참고용 임시 시뮬레이션 다이어그램을 출력합니다.");
        }
      }
    } catch (err: any) {
      setDiagramError(err.message || "이미지 생성 도중 알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsGeneratingDiagram(false);
    }
  };

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

    setShowDiagramModal(false);
    setDiagramPrompt("");
    setGeneratedDiagramUrl(null);
    setDiagramError(null);
  };

  return {
    showDiagramModal,
    setShowDiagramModal,
    diagramSectionId,
    setDiagramSectionId,
    diagramPrompt,
    setDiagramPrompt,
    diagramStyle,
    setDiagramStyle,
    diagramAspectRatio,
    setDiagramAspectRatio,
    isGeneratingDiagram,
    generatedDiagramUrl,
    diagramError,
    handleGenerateDiagram,
    handleInsertDiagram
  };
}
