let cachedApiKey: string | null = null;

export async function fetchApiKey(): Promise<string> {
  if (typeof window !== "undefined") {
    const localKey = localStorage.getItem("GEMINI_API_KEY");
    if (localKey && localKey.trim()) {
      return localKey.trim();
    }
  }
  if (cachedApiKey !== null) return cachedApiKey;
  try {
    const res = await fetch("/api/get-gemini-key");
    if (res.ok) {
      const data = await res.json();
      cachedApiKey = data.apiKey || "";
      return cachedApiKey;
    }
  } catch (err) {
    console.warn("Failed to fetch Gemini API Key from server:", err);
  }
  return "";
}

async function clientGenerateWithRetry(
  apiKey: string,
  model: string,
  contents: any,
  config: any = {},
  retries = 5,
  initialDelay = 3000
): Promise<any> {
  let delay = initialDelay;
  
  // Format contents to the format expected by raw REST API
  const formattedContents = typeof contents === "string"
    ? [{ parts: [{ text: contents }] }]
    : contents;

  // Build the generationConfig
  const generationConfig: any = {};
  if (config.responseMimeType) generationConfig.responseMimeType = config.responseMimeType;
  if (config.responseSchema) generationConfig.responseSchema = config.responseSchema;
  if (config.temperature !== undefined) generationConfig.temperature = config.temperature;
  if (config.responseModalities) generationConfig.responseModalities = config.responseModalities;
  if (config.imageConfig) generationConfig.imageConfig = config.imageConfig;

  const requestBody: any = {
    contents: formattedContents,
  };
  if (Object.keys(generationConfig).length > 0) {
    requestBody.generationConfig = generationConfig;
  }

  for (let i = 0; i < retries; i++) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error (HTTP ${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      // Extract text or parts
      let text = "";
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        text = data.candidates[0].content.parts[0].text;
      }
      
      return {
        text,
        candidates: data.candidates,
      };
    } catch (error: any) {
      const errorMessage = error?.message || "";
      const isQuotaExceeded = errorMessage.includes("Quota exceeded") || 
                              errorMessage.includes("quota") || 
                              errorMessage.includes("Quota") ||
                              errorMessage.includes("exceeded your current quota") ||
                              errorMessage.includes("429") ||
                              errorMessage.includes("RESOURCE_EXHAUSTED");

      if (isQuotaExceeded) {
        console.warn(`[Client Gemini] Quota limit exceeded or 429 for model ${model}. Failing immediately to switch models.`);
        throw error; // Fail immediately to proceed with next model fallback
      }

      const isServerError = errorMessage.includes("500") || 
                            errorMessage.includes("503") || 
                            errorMessage.includes("INTERNAL") ||
                            errorMessage.includes("UNAVAILABLE");

      if (isServerError && i < retries - 1) {
        console.warn(`[Client Gemini] Server error. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        throw error;
      }
    }
  }
  throw new Error("Gemini API 호출의 한도가 초과되었습니다.");
}

export async function clientGenerateWithModelFallback(
  apiKey: string,
  models: string[],
  contents: any,
  config: any = {}
): Promise<any> {
  let lastError: any;
  for (const model of models) {
    try {
      console.log(`[Client Gemini] Trying model: ${model}`);
      return await clientGenerateWithRetry(apiKey, model, contents, config);
    } catch (error: any) {
      lastError = error;
      console.error(`[Client Gemini] Model ${model} failed:`, error.message);
      continue; // Fallback to next model
    }
  }
  throw lastError;
}

// 1. RFP 분석 클라이언트 사이드 실행
export async function clientAnalyzeRfp(
  apiKey: string,
  config: {
    announcementText: string;
    rfpText: string;
    templateText: string;
    referenceText: string;
    companyName: string;
    projectDuration: string;
    writingStyle: string;
    customPrompt: string;
    targetPages: number;
  }
): Promise<any> {
  const prompt = `
당신은 국가 및 공공기관, 대기업 대형 프로젝트의 제안서(사업계획서) 작성을 전담하는 20년 경력의 수석 제안 컨설턴트(Bid Manager)이자 아키텍트입니다.
업로드된 4가지 종류의 문서(공고문, RFP, 표준 양식, 참고 문서)를 깊이 있게 분석하여, 실제로 최고 득점을 받을 수 있는 '체계적인 ${config.targetPages}페이지 규모 사업계획서 설계도(목차 및 작성 방안)'를 설계해 주세요.

[분석용 다중 데이터]
1. 사업 공고문:
${config.announcementText ? config.announcementText.slice(0, 10000) : "제공되지 않음 (아래 RFP 위주 분석)"}

2. 제안요청서(RFP) 및 요구사항 명세:
${config.rfpText ? config.rfpText.slice(0, 15000) : "제공되지 않음 (위 공고문 위주 분석)"}

3. 희망 사업계획서 표준 양식 및 필수 가이드라인:
${config.templateText ? config.templateText.slice(0, 5000) : "기본 표준 사업계획서 양식 준수 및 AI 최적화 설계"}

4. 참고 문서 및 추가 참조 기술 사양:
${config.referenceText ? config.referenceText.slice(0, 5000) : "제공되지 않음 (기본 공통 우수 사례 활용)"}

- 제안사명: ${config.companyName}
- 사업 수행 기간: ${config.projectDuration}
- 선호하는 작법 문체 스타일: ${
    config.writingStyle === "bullet" ? "전문가용 개조식 (명사형 종결, 가독성 극대화)" :
    config.writingStyle === "formal" ? "신뢰감을 주는 평서체 (~다로 끝나는 서술형)" :
    config.writingStyle === "polite" ? "설득력 있는 정중한 경어체 (~습니다, ~합니다)" : "기본 비즈니스 공식 문체"
  }
${config.customPrompt ? `- [사용자 지정 핵심 기획 방향 및 추가 프롬프팅 요구사항]: ${config.customPrompt}\n` : ""}

[작성 요구사항]
- 제공된 4대 문서의 요건들과 완벽히 매핑되는 최고 수준의 맞춤형 대용량 사업계획서 목차(15개 이상 세부 섹션)를 제안하십시오.
- 각 목차 항목(section)은 실제 ${config.targetPages}페이지 분량의 사업계획서로 확장될 수 있도록 매우 구체적인 작성 내용과 상세 공백 비율(목표 페이지수)을 산정해야 합니다. 모든 섹션의 'estimatedPages' 합산 값이 정확히 ${config.targetPages}에 최대한 수렴하도록 정밀하게 계획해 주십시오. (예: 50페이지라면 총합 50에 가깝게, 300페이지라면 총합 300에 가깝게 분배)
- 한국어 비즈니스 전문 용어와 공식 톤앤매너를 사용해 완벽히 응답하십시오.

응답은 반드시 아래 JSON 형식으로 제공해야 합니다. 마크다운 블록(\`\`\`json) 기호 없이 순수 JSON 텍스트로 반환하십시오.

[출력 JSON 형식 스키마]
{
  "projectTitle": "공식 선정 또는 예상되는 전체 사업 제안명",
  "projectGoal": "RFP 핵심 목적 요약 (100자 내외)",
  "companyStrengthRecommendation": "제안사(${config.companyName})를 위한 제안 전략 핵심 포인트 요약 (200자 내외)",
  "evaluationCriteria": [
    { "criterion": "평가 항목명", "importance": "상/중/하", "strategy": "고득점 획득 전략" }
  ],
  "sections": [
    {
      "sectionId": "sec-1",
      "parentTitle": "대분류 제목 (예: I. 제안 개요 및 사업 이해)",
      "subTitle": "세부 섹션 제목 (예: 1.1 제안 목적 및 배경)",
      "keyFocus": "이 항목에서 다루어야 하는 핵심 RFP 요건 및 기술 내용",
      "estimatedPages": 15,
      "estimatedWords": 3500
    }
  ]
}
`;

  const response = await clientGenerateWithModelFallback(
    apiKey,
    ["gemini-2.5-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    prompt,
    { responseMimeType: "application/json" }
  );

  const resultText = response.text || "";
  return JSON.parse(resultText.trim());
}

// 2. 단일 섹션 집필 클라이언트 사이드 실행
export async function clientGenerateSection(
  apiKey: string,
  config: {
    sectionId: string;
    parentTitle: string;
    subTitle: string;
    keyFocus: string;
    estimatedPages: number;
    announcementText: string;
    rfpText: string;
    templateText: string;
    referenceText: string;
    companyName: string;
    projectDuration: string;
    generatedContext: string;
    writingStyle: string;
    customPrompt: string;
  }
): Promise<any> {
  const prompt = `
당신은 국가 및 기업 제안요청서(RFP)를 기반으로 고도화된 전문 사업계획서를 집필하는 특급 제안서 전문 작가(Proposal Writer)입니다.
현재 작성해야 하는 섹션은 [${config.parentTitle} > ${config.subTitle}] 입니다.

이 섹션의 원래 설계 목표 분량은 약 ${config.estimatedPages}페이지 분량에 달하는 대형 보고서의 핵심 챕터입니다.
주어진 공고문, RFP, 표준 양식, 그리고 제안 참고 지식을 모두 활용하여, **실제 보고서에 그대로 삽입하여 바로 인쇄/제출이 가능할 정도로 극도로 정교하고 상세한 본문 내용**을 풍부한 텍스트와 전문적인 표, 마크다운 형식으로 한글로 깊이 있게 작성해 주십시오.

[컨텍스트 정보]
- 작성 중인 챕터: ${config.parentTitle} > ${config.subTitle}
- 세부 요구 요약: ${config.keyFocus}
- 제안사명: ${config.companyName}
- 사업 수행 기간: ${config.projectDuration}

[종합 제안 설계 참고 문서]
${config.announcementText ? `[1. 사업 공고문 가이드]\n${config.announcementText.slice(0, 4000)}\n` : ""}
${config.rfpText ? `[2. 제안요청서 (RFP) 주요 과업 요건]\n${config.rfpText.slice(0, 6000)}\n` : ""}
${config.templateText ? `[3. 표준 양식 및 가이드라인]\n${config.templateText.slice(0, 3000)}\n` : ""}
${config.referenceText ? `[4. 제안 참고 자료 및 내부 기술 정보]\n${config.referenceText.slice(0, 4000)}\n` : ""}

${config.generatedContext ? `[이전 작성된 내용 개요]\n${config.generatedContext}` : ""}

[문체 및 서술체 어조 설정 - 매우 중요, 엄격히 준수]
${
  config.writingStyle === "bullet" 
    ? "• 반드시 명사형 종결 개조식 (~함, ~임, ~수립, ~지원)을 기반으로, 각 하위 항목을 한눈에 알아보기 쉽게 체계적인 단락(Bullet point) 형태로 작성하십시오. 만연체나 불필요하게 긴 설명조를 지양하고, 실제 제안서 실무 핵심 요약집처럼 고도의 가독성을 유지하십시오."
    : config.writingStyle === "formal"
    ? "• 반드시 차분하고 객관적인 평서문 (~다, ~한다, ~하며) 위주로 명확하게 서술하십시오. 공신력과 정제된 논리를 보여주어야 하며, 명사로 끊어지는 명사형 문장보다는 완결된 형태의 평서문을 풍부하게 사용하여 논리 전개의 깊이를 보여주십시오."
    : "• 반드시 정중하고 설득력이 극대화된 고객 지향 경어체 (~습니다, ~합니다, ~구축하겠습니다)를 사용하십시오. 당사의 의지와 전문성을 적극 어필하며 고객의 신뢰를 살 수 있도록 매끄럽고 설득력 있는 문체로 내용을 상세히 설명하십시오."
}

${config.customPrompt ? `[사용자 지정 추가 프롬프팅 지침 - 최우선 반영]\n${config.customPrompt}\n` : ""}

[작성 지침 - 엄격 준수]
1. **전문성 및 밀도**: 개조식 문장(두괄식 요약, 구체적인 세부 항목 나열)과 서술형을 황금 비율로 혼합하십시오. 모호하고 추상적인 문장은 모두 배제하고 실제 수행 계획, 구체적인 기술 스펙, 정량적 수치, 가상의 프로세스를 실무 레벨로 명시하십시오.
2. **구조화**: 장/절/항/세항 구조로 명확히 단계를 나누고, 전문 비즈니스 보고서 양식에 맞추어 작성하십시오.
   - 예: "1. 추진 개요", "1.1 필요성 및 추진 배경", "1.2 추진 목적 및 주요 방향"
3. **풍부한 볼륨**: 최소 3000자 이상의 고밀도 비즈니스 한국어 텍스트로 채우십시오.
4. **마크다운 표(Table) 활용**: 반드시 비교 분석표, 업무 분담표, 기술 아키텍처 사양표, 비용 내역표, 추진 일정표 등 해당 주제와 관련된 전문적인 마크다운 표(Table)를 1개 이상 포함하십시오.
5. **텍스트 장식 및 가독성**: 중요한 용어는 Bold, Code block(\`...\`), 인용문 등을 적극 활용하여 시각적으로도 가독성이 높은 보고서 형태로 만드십시오.
6. **실제 사업 느낌의 가상 데이터**: 금액, 하드웨어 사양, 인적 구성, 소프트웨어 버전 등 가상의 세부 데이터를 매우 구체적으로 작성하여 높은 완성도를 부여하십시오.
`;

  const response = await clientGenerateWithModelFallback(
    apiKey,
    ["gemini-2.5-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    prompt,
    { temperature: 0.25 }
  );

  return {
    sectionId: config.sectionId,
    subTitle: config.subTitle,
    content: response.text || "",
    generatedAt: new Date().toISOString()
  };
}

// 3. 정합성 점검 클라이언트 사이드 실행
export async function clientCheckConsistency(
  apiKey: string,
  config: {
    companyName: string;
    projectDuration: string;
    writingStyle: string;
    sections: any[];
    projectGoal: string;
    companyStrengthRecommendation: string;
  }
): Promise<any> {
  let combinedDoc = `[문서 설정 기준 정보]\n`;
  combinedDoc += `- 기준 제안사명: ${config.companyName}\n`;
  combinedDoc += `- 기준 사업 수행 기간: ${config.projectDuration}\n`;
  combinedDoc += `- 기준 작법 스타일: ${config.writingStyle}\n\n`;
  combinedDoc += `[0. 프로젝트 요약]\n${config.projectGoal}\n\n`;
  combinedDoc += `[0.1 핵심 제안 전략]\n${config.companyStrengthRecommendation}\n\n`;

  config.sections.forEach((sec: any) => {
    combinedDoc += `[섹션: ${sec.parentTitle} - ${sec.subTitle}]\n`;
    combinedDoc += `${sec.content || "(미집필 상태)"}\n\n`;
  });

  const prompt = `
당신은 대한민국 초대형 정부/대기업 비즈니스 제안서 심사위원 및 전문 감리단입니다.
제공된 대용량 사업계획서 내용 전체를 대조하여, **핵심 키워드 불일치, 수치 충돌, 회사명 오탈자, 그리고 기획 어조 위반 사항**을 정밀 감사해주십시오.

[기준 정보]
- 제안사명: "${config.companyName}" (이 외의 다른 회사명이나 가상 사명이 본문에 불쑥 기재되면 안 됨)
- 사업 기간: "${config.projectDuration}" (이 외의 다른 기간 예컨대 "6개월", "18개월" 등이 타 섹션에서 모순되게 명급되면 오류)
- 문체 스타일: ${
    config.writingStyle === "bullet" ? "개조식 (명사형 종결, ~함, ~임, ~수립, ~구축)" :
    config.writingStyle === "formal" ? "평서체 (~다로 끝나는 서술문)" : "경어체 (~습니다, ~합니다로 설득)"
  }

[점검 대상 문서 데이터]
${combinedDoc}

위 문서를 전수조사하여 발견한 주요 위반, 모순, 혹은 잘 지켜진 우수 사항들을 다음 JSON 구조로 응답해주십시오.
반드시 정확한 JSON 배열 형식만 리턴하여 주십시오.

[JSON Schema]
[
  {
    "type": "success" | "warning" | "error",
    "field": "회사명" | "사업 기간" | "문체 어조" | "용어 일관성" | "기획 모순" | "우수 사항",
    "section": "섹션명",
    "description": "상세한 위반 또는 일치 사항 서술",
    "resolution": "조치 가이드라인 및 수정 제안"
  }
]

최대 6~8개의 핵심 체크 항목을 추출하십시오. 만약 문서에 하자가 없다면 정합성이 우수함을 어필하는 "success" 타입 항목들로 채우고, 의심되는 모든 구석(예: 기간 모순, 타 기업명 노출, 문체 불일치 등)은 엄격하고 매섭게 피드백해주십시오.
`;

  const response = await clientGenerateWithModelFallback(
    apiKey,
    ["gemini-2.5-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    prompt,
    // Pass custom REST schema to enforce JSON output structure
    {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            type: { type: "STRING" },
            field: { type: "STRING" },
            section: { type: "STRING" },
            description: { type: "STRING" },
            resolution: { type: "STRING" }
          },
          required: ["type", "field", "section", "description", "resolution"]
        }
      },
      temperature: 0.1
    }
  );

  const resultText = response.text || "[]";
  const auditResults = JSON.parse(resultText.trim());

  let score = 100;
  auditResults.forEach((r: any) => {
    if (r.type === "error") score -= 15;
    else if (r.type === "warning") score -= 5;
  });
  const finalScore = Math.max(score, 30);

  return {
    success: true,
    score: finalScore,
    results: auditResults
  };
}

// 4. 다이어그램 도식화 클라이언트 사이드 실행
export async function clientGenerateDiagram(
  apiKey: string,
  config: {
    prompt: string;
    style: string;
    aspectRatio: string;
  }
): Promise<any> {
  let stylePrompt = "";
  if (config.style === "isometric") {
    stylePrompt = "clean modern isometric 3D vector diagram, tech startup cloud infrastructure, professional engineering design, high-contrast, beautiful gradient lighting, soft grid background, highly detailed";
  } else if (config.style === "flat") {
    stylePrompt = "minimalist flat design technical vector diagram, modern system flow chart, simple geometric shapes, clean typography placeholder, elegant professional color palette";
  } else if (config.style === "blueprint") {
    stylePrompt = "precise technical blueprint schematic diagram, engineering draft style, white and cyan lines on deep blue space background, futuristic tech layout, grid lines, high-tech engineering draft";
  } else if (config.style === "infographic") {
    stylePrompt = "modern professional infographic flow chart, business process diagram, clean circular and rectangular connected steps, clean and highly readable layout";
  }

  const finalImagePrompt = `${config.prompt}. Style: ${stylePrompt}. High quality, crisp vector details, centered composition, no realistic human faces, suitable for a professional corporate business proposal or RFP response.`;

  console.log("[Client Gemini] Generating diagram with prompt:", finalImagePrompt);

  try {
    const response = await clientGenerateWithModelFallback(
      apiKey,
      ["gemini-2.0-flash-preview-image-generation", "gemini-1.5-pro"],
      finalImagePrompt,
      {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio: config.aspectRatio === "16:9" ? "16:9" : "4:3",
          imageSize: "1K"
        }
      }
    );

    let base64Image = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Image) {
      throw new Error("이미지 데이터가 리턴되지 않았습니다.");
    }

    return {
      success: true,
      imageUrl: `data:image/png;base64,${base64Image}`
    };
  } catch (err: any) {
    console.error("[Client Gemini] Image generation failed, returning fallback:", err);
    const query = encodeURIComponent(config.prompt || "Tech Diagram");
    return {
      success: false,
      isFallback: true,
      imageUrl: `https://picsum.photos/seed/${query}/1200/675?blur=1`,
      error: err.message || "이미지 생성 실패"
    };
  }
}
