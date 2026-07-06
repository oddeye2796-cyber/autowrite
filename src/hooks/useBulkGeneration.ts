import { useState, useEffect, useRef } from "react";
import { ProposalOutline } from "../types";

export function useBulkGeneration(
  outline: ProposalOutline | null,
  handleGenerateSection: (sectionId: string, rewriteInstructions?: string) => Promise<boolean>
) {
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState<number>(-1);

  const outlineRef = useRef(outline);
  const isBulkGeneratingRef = useRef(isBulkGenerating);
  const isLoopRunningRef = useRef(false);

  useEffect(() => {
    outlineRef.current = outline;
  }, [outline]);

  useEffect(() => {
    isBulkGeneratingRef.current = isBulkGenerating;
  }, [isBulkGenerating]);

  // Bulk continuous compile loop
  useEffect(() => {
    if (!isBulkGenerating || !outline) return;
    if (isLoopRunningRef.current) return;
    
    const runBulk = async () => {
      isLoopRunningRef.current = true;
      
      while (isBulkGeneratingRef.current && outlineRef.current) {
        const currentOutline = outlineRef.current;
        const pendingIndex = currentOutline.sections.findIndex((s) => !s.isDone && !s.isGenerating);
        
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
  }, [isBulkGenerating, outline, handleGenerateSection]);

  return {
    isBulkGenerating,
    setIsBulkGenerating,
    currentGeneratingIndex,
    setCurrentGeneratingIndex,
  };
}
