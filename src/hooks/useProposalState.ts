import { useState, useRef, useEffect } from "react";
import { ProposalOutline } from "../types";
import { fetchApiKey, clientAnalyzeRfp, clientGenerateSection } from "../utils/geminiClient";

export function useProposalState(getFriendlyErrorMessage: (response: Response, defaultMessage: string) => Promise<string>) {
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

  const outlineRef = useRef(outline);
  useEffect(() => {
    outlineRef.current = outline;
  }, [outline]);

  async function runServerAnalyze(config: any): Promise<ProposalOutline> {
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

    return await response.json();
  }

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
      let data: ProposalOutline;
      const apiKey = await fetchApiKey();
      if (apiKey) {
        try {
          console.log("[useProposalState] Running client-side RFP analysis...");
          data = await clientAnalyzeRfp(apiKey, config);
        } catch (clientErr: any) {
          console.warn("[useProposalState] Client-side RFP analysis failed, falling back to server:", clientErr);
          data = await runServerAnalyze(config);
        }
      } else {
        data = await runServerAnalyze(config);
      }
      
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

  async function runServerGenerate(reqConfig: any): Promise<any> {
    const response = await fetch("/api/generate-section", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqConfig),
    });

    if (!response.ok) {
      const friendlyError = await getFriendlyErrorMessage(response, "본문 생성에 실패하였습니다.");
      throw new Error(friendlyError);
    }

    return await response.json();
  }

  const handleGenerateSection = async (
    sectionId: string, 
    rewriteInstructions: string = "", 
    setEditingContent?: (content: string) => void
  ) => {
    const currentOutline = outlineRef.current;
    if (!currentOutline) return false;

    const targetIndex = currentOutline.sections.findIndex((s) => s.sectionId === sectionId);
    if (targetIndex === -1) return false;

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
      const reqConfig = {
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
      };

      let result;
      const apiKey = await fetchApiKey();
      if (apiKey) {
        try {
          console.log("[useProposalState] Running client-side section generation...");
          result = await clientGenerateSection(apiKey, reqConfig);
        } catch (clientErr: any) {
          console.warn("[useProposalState] Client-side section generation failed, falling back to server:", clientErr);
          result = await runServerGenerate(reqConfig);
        }
      } else {
        result = await runServerGenerate(reqConfig);
      }
      
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
      
      if (setEditingContent && selectedSectionId === sectionId) {
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

  return {
    announcementText, setAnnouncementText,
    rfpText, setRfpText,
    templateText, setTemplateText,
    referenceText, setReferenceText,
    companyName, setCompanyName,
    projectDuration, setProjectDuration,
    writingStyle, setWritingStyle,
    rfpCustomPrompt, setRfpCustomPrompt,
    isLoadingOutline, setIsLoadingOutline,
    outline, setOutline,
    selectedSectionId, setSelectedSectionId,
    handleAnalyzeRfp,
    handleGenerateSection
  };
}
