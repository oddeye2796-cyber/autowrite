import { useState } from "react";
import { ProposalOutline } from "../types";
import { fetchApiKey, clientCheckConsistency } from "../utils/geminiClient";

export function useConsistency(
  outline: ProposalOutline | null,
  companyName: string,
  projectDuration: string,
  writingStyle: string,
  getFriendlyErrorMessage: (response: Response, defaultMessage: string) => Promise<string>
) {
  const [showConsistencyModal, setShowConsistencyModal] = useState(false);
  const [isCheckingConsistency, setIsCheckingConsistency] = useState(false);
  const [consistencyResults, setConsistencyResults] = useState<any[] | null>(null);
  const [consistencyScore, setConsistencyScore] = useState<number | null>(null);
  const [consistencyError, setConsistencyError] = useState<string | null>(null);

  async function runServerConsistency(): Promise<any> {
    if (!outline) return;
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

    return await response.json();
  }

  const handleCheckConsistency = async () => {
    if (!outline) return;
    setIsCheckingConsistency(true);
    setConsistencyError(null);
    setConsistencyResults(null);
    setConsistencyScore(null);
    setShowConsistencyModal(true);

    try {
      let data;
      const apiKey = await fetchApiKey();
      if (apiKey) {
        try {
          console.log("[useConsistency] Running client-side consistency check...");
          data = await clientCheckConsistency(apiKey, {
            companyName,
            projectDuration,
            writingStyle,
            sections: outline.sections,
            projectGoal: outline.projectGoal,
            companyStrengthRecommendation: outline.companyStrengthRecommendation
          });
        } catch (clientErr: any) {
          console.warn("[useConsistency] Client-side consistency check failed, falling back to server:", clientErr);
          data = await runServerConsistency();
        }
      } else {
        data = await runServerConsistency();
      }

      if (data) {
        setConsistencyResults(data.results);
        setConsistencyScore(data.score);
      }
    } catch (err: any) {
      setConsistencyError(err.message || "서버 통신 실패");
    } finally {
      setIsCheckingConsistency(false);
    }
  };

  return {
    showConsistencyModal,
    setShowConsistencyModal,
    isCheckingConsistency,
    consistencyResults,
    consistencyScore,
    consistencyError,
    handleCheckConsistency
  };
}
