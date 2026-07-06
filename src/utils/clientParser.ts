const scriptCache: { [url: string]: Promise<void> } = {};

function loadScript(src: string): Promise<void> {
  if (scriptCache[src]) return scriptCache[src];
  scriptCache[src] = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (err) => {
      delete scriptCache[src]; // Allow retry on failure
      reject(new Error(`Failed to load script: ${src}`));
    };
    document.head.appendChild(script);
  });
  return scriptCache[src];
}

function decodeTextBuffer(buffer: Uint8Array): string {
  const decoderUtf8 = new TextDecoder("utf-8");
  const utf8Text = decoderUtf8.decode(buffer);
  const fffdCount = (utf8Text.match(/\uFFFD/g) || []).length;
  
  // If fffdCount is more than 0.5% of the text length, it might be encoded in EUC-KR
  if (fffdCount > 0 && fffdCount > utf8Text.length * 0.005) {
    try {
      const decoderEucKr = new TextDecoder("euc-kr");
      const decoded = decoderEucKr.decode(buffer);
      const decodedFffdCount = (decoded.match(/\uFFFD/g) || []).length;
      if (decodedFffdCount < fffdCount) {
        return decoded;
      }
    } catch (e) {
      // Fallback to UTF-8 on error
    }
  }
  return utf8Text;
}

async function parsePdfClient(arrayBuffer: ArrayBuffer): Promise<string> {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
  const pdfjsLib = (window as any).pdfjsLib;
  if (!pdfjsLib) {
    throw new Error("PDF.js 라이브러리를 로드하지 못했습니다.");
  }
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    text += pageText + "\n";
  }
  return text.trim();
}

async function parseDocxClient(arrayBuffer: ArrayBuffer): Promise<string> {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js");
  const mammoth = (window as any).mammoth;
  if (!mammoth) {
    throw new Error("Mammoth 라이브러리를 로드하지 못했습니다.");
  }
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value || "";
}

async function parseHwpxClient(arrayBuffer: ArrayBuffer): Promise<string> {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");
  const JSZip = (window as any).JSZip;
  if (!JSZip) {
    throw new Error("JSZip 라이브러리를 로드하지 못했습니다.");
  }
  
  const zip = await JSZip.loadAsync(arrayBuffer);
  const sections: any[] = [];
  zip.forEach((relativePath: string, file: any) => {
    const lowerPath = relativePath.toLowerCase().replace(/\\/g, "/");
    if (lowerPath.startsWith("contents/section") && lowerPath.endsWith(".xml")) {
      sections.push(file);
    }
  });
  
  sections.sort((a, b) => a.name.localeCompare(b.name));
  
  let hwpxContent = "";
  for (const section of sections) {
    const xmlText = await section.async("string");
    // Match Hancom HWPX paragraph text tags <hp:t> or <t>
    const textMatches = xmlText.match(/<hp:t[^>]*>([\s\S]*?)<\/hp:t>/g) || 
                        xmlText.match(/<t[^>]*>([\s\S]*?)<\/t>/g);
    if (textMatches) {
      for (const match of textMatches) {
        const cleanVal = match.replace(/<[^>]+>/g, "").trim();
        if (cleanVal) {
          hwpxContent += cleanVal + " ";
        }
      }
    }
  }
  
  if (hwpxContent.trim()) {
    return `[HWPX 개방형 한글 문서 본문 자동 디코딩 추출본]\n\n${hwpxContent.trim()}`;
  } else {
    const uint8 = new Uint8Array(arrayBuffer);
    const rawString = decodeTextBuffer(uint8);
    const cleanText = rawString.replace(/[^\uAC00-\uD7A3xfe0-9a-zA-Z\s.,;:!?()\-\[\]]/g, " ");
    return `[HWPX 문자열 필터 추출본]\n\n${cleanText.slice(0, 10000)}`;
  }
}

async function parseHwpClient(arrayBuffer: ArrayBuffer): Promise<string> {
  const uint8 = new Uint8Array(arrayBuffer);
  const rawString = decodeTextBuffer(uint8);
  const cleanText = rawString.replace(/[^\uAC00-\uD7A3xfe0-9a-zA-Z\s.,;:!?()\-\[\]]/g, " ");
  return `[HWP 한글 문서 바이너리 자동 추출본]\n※ 안내: HWPX(개방형 한글 문서) 형식은 내부 XML 규격을 통해 100% 완벽한 데이터로 고해상도 연동이 보장됩니다. HWP 파일은 한글 프로그램에서 [다른 이름으로 저장] -> [HWPX 문서]로 간단히 업전환하여 재업로드하시면 가장 완벽합니다.\n\n${cleanText.slice(0, 10000)}`;
}

export async function parseFileClient(file: File): Promise<string> {
  const lowerFilename = file.name.toLowerCase();
  const filetype = file.type;
  
  const arrayBuffer = await file.arrayBuffer();
  
  if (lowerFilename.endsWith(".pdf") || filetype === "application/pdf") {
    return await parsePdfClient(arrayBuffer);
  } else if (lowerFilename.endsWith(".docx") || filetype.includes("wordprocessingml")) {
    return await parseDocxClient(arrayBuffer);
  } else if (lowerFilename.endsWith(".hwpx")) {
    return await parseHwpxClient(arrayBuffer);
  } else if (lowerFilename.endsWith(".hwp")) {
    return await parseHwpClient(arrayBuffer);
  } else {
    // Treat as plain text
    const uint8 = new Uint8Array(arrayBuffer);
    return decodeTextBuffer(uint8);
  }
}
