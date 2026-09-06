const requests = new Map<string, { count: number; expiresAt: number }>();

function clientKey(request: Request) {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
}

async function allowRequest(key: string) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (redisUrl && redisToken) {
    const response = await fetch(`${redisUrl}/pipeline`, {
      method: 'POST',
      headers: { authorization: `Bearer ${redisToken}`, 'content-type': 'application/json' },
      body: JSON.stringify([['INCR', `tv-legal:${key}`], ['EXPIRE', `tv-legal:${key}`, 3600, 'NX']]),
    });
    if (!response.ok) return false;
    const result = await response.json() as Array<{ result?: number }>;
    return Number(result[0]?.result || 0) <= 20;
  }
  const now = Date.now();
  const current = requests.get(key);
  if (!current || current.expiresAt <= now) { requests.set(key, { count: 1, expiresAt: now + 3600000 }); return true; }
  current.count += 1;
  return current.count <= 10;
}

const knowledge = `Nguồn và nguyên tắc đã chọn lọc:
- Nghị định 52/2024/NĐ-CP: tổ chức không phải ngân hàng muốn cung ứng dịch vụ trung gian thanh toán phải được Ngân hàng Nhà nước cấp phép.
- Thông tư 40/2024/TT-NHNN và văn bản sửa đổi, hợp nhất: mở và sử dụng ví, nhận biết khách hàng, tài khoản bảo đảm, an toàn và quản lý rủi ro.
- Luật Giao dịch điện tử 20/2023/QH15; Luật Bảo vệ quyền lợi người tiêu dùng 19/2023/QH15; Luật Phòng, chống rửa tiền 14/2022/QH15.
- Luật Dữ liệu 60/2024/QH15; Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15; Nghị định 356/2025/NĐ-CP.
- Đăng ký doanh nghiệp không thay giấy phép trung gian thanh toán. Hợp đồng API không mặc nhiên cho bên tích hợp giữ tiền, lấy thông tin đăng nhập hoặc dùng dữ liệu ngoài mục đích giao dịch. Hợp đồng phải bám luồng tiền, dữ liệu, tài liệu kỹ thuật, SLA, đối soát, tra soát và sự cố.`;

export async function POST(request: Request) {
  try {
    if (!(await allowRequest(clientKey(request)))) return Response.json({ error: 'Đã vượt giới hạn tạm thời. Vui lòng thử lại sau.' }, { status: 429 });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return Response.json({ error: 'Trợ lý AI chưa được kích hoạt. Chủ dự án cần cấu hình OPENAI_API_KEY trên máy chủ.' }, { status: 503 });
    const body = await request.json() as { message?: unknown; selectedText?: unknown };
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const selectedText = typeof body.selectedText === 'string' ? body.selectedText.trim().slice(0, 3000) : '';
    if (!message || message.length > 1500) return Response.json({ error: 'Câu hỏi phải có từ 1 đến 1.500 ký tự.' }, { status: 400 });

    const prompt = `Bạn là trợ lý học tập pháp luật Việt Nam, chỉ giải thích về ví điện tử, trung gian thanh toán và Fintech. Trả lời tiếng Việt, rõ ràng, thận trọng, tối đa khoảng 600 từ. Chỉ dựa vào nguồn dưới đây; không tra cứu web, không bịa điều khoản. Thiếu căn cứ thì nói cần kiểm tra toàn văn. Câu hỏi ngoài phạm vi thì từ chối ngắn. Ưu tiên cấu trúc: Giải thích ngắn; Ý nghĩa với ví điện tử; Căn cứ liên quan; Lưu ý. Luôn kết thúc rằng đây không phải tư vấn cho vụ việc cụ thể.

${knowledge}
${selectedText ? `Đoạn đang xem:\n---\n${selectedText}\n---\n` : ''}Câu hỏi: ${message}`;
    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-5.5', input: prompt, reasoning: { effort: 'low' }, text: { verbosity: 'low' }, max_output_tokens: 700, stream: true, store: false }),
    });
    if (!upstream.ok || !upstream.body) {
      console.error('OpenAI error', upstream.status, (await upstream.text()).slice(0, 300));
      return Response.json({ error: 'Dịch vụ AI chưa sẵn sàng. Vui lòng thử lại sau.' }, { status: 502 });
    }
    return new Response(upstream.body, { headers: { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache, no-transform', 'x-content-type-options': 'nosniff' } });
  } catch (error) {
    console.error('Assistant route error', error);
    return Response.json({ error: 'Không thể xử lý yêu cầu lúc này.' }, { status: 500 });
  }
}
