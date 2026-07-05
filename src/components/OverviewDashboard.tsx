import React from "react";
import { Award, CheckCircle, Lightbulb, Target, Sparkles, Building } from "lucide-react";
import { ProposalOutline } from "../types";

interface OverviewDashboardProps {
  outline: ProposalOutline;
  companyName: string;
}

export default function OverviewDashboard({ outline, companyName }: OverviewDashboardProps) {
  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6">
      {/* Upper Meta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            <CheckCircle className="h-3 w-3" />
            <span>RFP 분석 완료</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
            {outline.projectTitle}
          </h2>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-2 shrink-0 self-start md:self-auto">
          <Building className="h-4 w-4 text-indigo-500" />
          <span>수행사: {companyName}</span>
        </div>
      </div>

      {/* Main Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Goal */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Target className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">프로젝트 핵심 목표</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {outline.projectGoal}
          </p>
        </div>

        {/* Dynamic Bid Strategy Recommendation */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Lightbulb className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">핵심 제안 침투 전략</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {outline.companyStrengthRecommendation}
          </p>
        </div>
      </div>

      {/* Evaluation Matrix Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Award className="h-4 w-4 text-slate-400" /> 제안서 평가위원 공략용 고득점 획득 전략 Matrix
        </h3>
        <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
              <tr>
                <th scope="col" className="px-6 py-3.5">핵심 평가 항목</th>
                <th scope="col" className="px-6 py-3.5 text-center">RFP 배점 중요도</th>
                <th scope="col" className="px-6 py-3.5">기술 공략 및 심사위원 감동 요소</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs text-slate-600">
              {outline.evaluationCriteria.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition duration-150">
                  <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap md:whitespace-normal max-w-xs">
                    {item.criterion}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      item.importance === "상"
                        ? "bg-rose-50 text-rose-700 border border-rose-100"
                        : item.importance === "중"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : "bg-slate-50 text-slate-600 border border-slate-100"
                    }`}>
                      우선순위 [{item.importance}]
                    </span>
                  </td>
                  <td className="px-6 py-4 leading-relaxed font-medium">
                    {item.strategy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
