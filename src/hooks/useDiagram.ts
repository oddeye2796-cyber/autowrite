import { useState } from "react";
import { ProposalOutline } from "../types";

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
        setGeneratedDiagramUrl(data.imageUrl);
        setDiagramError("이미지 생성이 대기 중이거나 한도 초과 상태입니다. 실무 참고용 임시 시뮬레이션 다이어그램을 출력합니다.");
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
