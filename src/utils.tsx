import React from "react";
import { BookMarked, Image } from "lucide-react";

export const getFriendlyErrorMessage = async (response: Response, defaultMessage: string): Promise<string> => {
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

// Render inline formatting (bold, code, italic)
export const renderInline = (text: string) => {
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
};

export const renderMarkdown = (text: string) => {
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
};
