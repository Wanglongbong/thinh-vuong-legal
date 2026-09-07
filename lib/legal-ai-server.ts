type AIResult = { text: string; mode: 'ai' | 'demo' };

export async function runLegalAI(
  prompt: string,
  fallback: string,
  maxOutputTokens = 1400,
): Promise<AIResult> {
  const directKey = process.env.OPENAI_API_KEY;
  const gatewayKey =
    process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
  const apiKey = directKey || gatewayKey;
  if (!apiKey) return { text: fallback, mode: 'demo' };

  try {
    const response = await fetch(
      directKey
        ? 'https://api.openai.com/v1/responses'
        : 'https://ai-gateway.vercel.sh/v1/responses',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: directKey ? 'gpt-5.5' : 'openai/gpt-5.5',
          input: prompt,
          reasoning: { effort: 'low' },
          text: { verbosity: 'medium' },
          max_output_tokens: maxOutputTokens,
          store: false,
        }),
      },
    );
    if (!response.ok) {
      console.error('Legal AI upstream error', response.status);
      return { text: fallback, mode: 'demo' };
    }
    const payload = (await response.json()) as {
      output_text?: string;
      output?: Array<{ content?: Array<{ text?: string }> }>;
    };
    const text =
      payload.output_text ||
      payload.output
        ?.flatMap((item) => item.content ?? [])
        .map((item) => item.text ?? '')
        .join('') ||
      '';
    return text.trim()
      ? { text: text.trim(), mode: 'ai' }
      : { text: fallback, mode: 'demo' };
  } catch (error) {
    console.error(
      'Legal AI request failed',
      error instanceof Error ? error.message : 'unknown',
    );
    return { text: fallback, mode: 'demo' };
  }
}

export function sanitizeDocumentText(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.split(String.fromCharCode(0)).join('').trim().slice(0, 50_000);
}

export const legalSystemRule = `Bạn là trợ lý học tập pháp luật Việt Nam của Thịnh Vượng Legal. Hãy dùng văn phong pháp lý mạch lạc, dễ hiểu như người học và làm luật; tách rõ vấn đề, quy tắc, áp dụng, dữ kiện còn thiếu và kết luận. Bạn có thể giải thích các lĩnh vực pháp luật Việt Nam, trong đó ví điện tử, dịch vụ trung gian thanh toán và Fintech là phạm vi dữ liệu chuyên sâu. Không bịa điều, khoản, số liệu, hiệu lực hoặc nguồn. Mọi kết luận có hệ quả thực tế phải đề nghị luật sư đủ điều kiện rà soát. Không coi nội dung tạo tự động là ý kiến pháp lý cuối cùng.`;
