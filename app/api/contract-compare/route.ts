import { diffLines } from 'diff';
import {
  legalSystemRule,
  runLegalAI,
  sanitizeDocumentText,
} from '@/lib/legal-ai-server';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    left?: unknown;
    right?: unknown;
    leftName?: unknown;
    rightName?: unknown;
    sources?: unknown;
  } | null;
  const left = sanitizeDocumentText(body?.left);
  const right = sanitizeDocumentText(body?.right);
  const leftName =
    typeof body?.leftName === 'string' ? body.leftName.slice(0, 240) : 'Bản A';
  const rightName =
    typeof body?.rightName === 'string'
      ? body.rightName.slice(0, 240)
      : 'Bản B';
  if (left.length < 80 || right.length < 80)
    return Response.json(
      { error: 'Cần hai hợp đồng có nội dung để so sánh.' },
      { status: 400 },
    );

  const changes = diffLines(left, right)
    .filter((part) => part.added || part.removed)
    .slice(0, 30)
    .map((part) => `${part.added ? 'THÊM' : 'BỎ'}: ${part.value.slice(0, 700)}`)
    .join('\n');
  const fallback = `TÓM TẮT SO SÁNH\nĐã phát hiện các đoạn được thêm hoặc loại bỏ giữa hai phiên bản.\n\nTHAY ĐỔI CHÍNH\n${
    changes || 'Không phát hiện khác biệt theo dòng.'
  }\n\nĐÁNH GIÁ\nChế độ dữ liệu mẫu chỉ xác định khác biệt nguyên văn. Cần AI hoặc luật sư đánh giá tác động pháp lý và mức tăng/giảm rủi ro.`;
  const prompt = `${legalSystemRule}\n\nSo sánh hai hợp đồng ví điện tử. Phân loại các thay đổi thành THÊM, BỎ hoặc SỬA; đánh giá tác động là TĂNG RỦI RO, GIẢM RỦI RO hoặc TRUNG TÍNH. Ưu tiên phạm vi giấy phép, phí và đối soát, SLA, dữ liệu, bảo mật, trách nhiệm, chấm dứt và tranh chấp. Kết thúc bằng phiên bản được khuyến nghị và thông tin còn thiếu.\n\nHợp đồng A: ${leftName}\n---\n${left}\n---\nHợp đồng B: ${rightName}\n---\n${right}\n---`;
  const result = await runLegalAI(prompt, fallback, 1800);
  return Response.json({ ...result, diff: changes });
}
