import { useState } from "react";
import { ProposalOutline } from "../types";

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
