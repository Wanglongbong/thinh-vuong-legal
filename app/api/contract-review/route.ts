import {
  legalSystemRule,
  runLegalAI,
  sanitizeDocumentText,
} from '@/lib/legal-ai-server';

const reviewAreas = [
  ['Phạm vi và giấy phép', ['phạm vi', 'giấy phép']],
  ['Phí và đối soát', ['phí', 'đối soát']],
  ['Nghiệm thu và SLA', ['nghiệm thu', 'sla']],
  ['Dữ liệu và bảo mật', ['dữ liệu', 'bảo mật']],
  ['Tra soát và hoàn tiền', ['tra soát', 'hoàn tiền']],
  ['Chấm dứt và chuyển tiếp', ['chấm dứt', 'tạm ngừng']],
] as const;

function fallbackReview(text: string) {
  const normalized = text.toLocaleLowerCase('vi');
  const lines = reviewAreas.map(([title, terms], index) => {
    const present = terms.some((term) => normalized.includes(term));
    return `${index + 1}. ${title} — ${present ? 'XANH' : 'VÀNG'}\n${
      present
        ? 'Đã nhận diện nội dung liên quan; cần kiểm tra tính đầy đủ, thẩm quyền và sự thống nhất giữa hợp đồng với phụ lục.'
        : 'Chưa nhận diện rõ nội dung này. Cần bổ sung hoặc xác định vị trí điều khoản trước khi ký.'
    }`;
  });
  return `TÓM TẮT RÀ SOÁT\nBản phân tích quy tắc đã kiểm tra các nhóm điều khoản cốt lõi của hợp đồng ví điện tử.\n\n${lines.join(
    '\n\n',
  )}\n\nKẾT LUẬN\nĐây là chế độ dữ liệu mẫu, chưa thay thế rà soát của luật sư và chưa xác nhận hiệu lực từng căn cứ cho giao dịch cụ thể.`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    text?: unknown;
    fileName?: unknown;
    sources?: unknown;
  } | null;
  const text = sanitizeDocumentText(body?.text);
  if (text.length < 80)
    return Response.json(
      { error: 'Nội dung hợp đồng quá ngắn để rà soát.' },
      { status: 400 },
    );

  const sources = Array.isArray(body?.sources)
    ? body?.sources.filter((item): item is string => typeof item === 'string')
    : [];
  const fileName =
    typeof body?.fileName === 'string'
      ? body.fileName.slice(0, 240)
      : 'Hợp đồng chưa đặt tên';
  const prompt = `${legalSystemRule}\n\nRà soát hợp đồng dưới đây theo văn phong luật học. Trình bày: TÓM TẮT; VẤN ĐỀ ĐỎ; VẤN ĐỀ VÀNG; NỘI DUNG XANH; THÔNG TIN CÒN THIẾU; KIẾN NGHỊ. Với từng vấn đề ghi rõ điều khoản, tác động kinh doanh, căn cứ trong danh mục nguồn được chọn và câu chữ đề xuất. Không khẳng định hiệu lực nguồn nếu chỉ có tên văn bản.\n\nNguồn được người dùng chọn:\n${sources.join(
    '\n',
  )}\n\nTệp: ${fileName}\n---\n${text}\n---`;
  const result = await runLegalAI(prompt, fallbackReview(text), 1800);
  return Response.json(result);
}
