import { contracts } from '@/lib/site-data';
import {
  legalSystemRule,
  runLegalAI,
  sanitizeDocumentText,
} from '@/lib/legal-ai-server';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    description?: unknown;
    referenceText?: unknown;
    contractSlug?: unknown;
  } | null;
  const description = sanitizeDocumentText(body?.description).slice(0, 5_000);
  const reference = sanitizeDocumentText(body?.referenceText);
  const selected = contracts.find((item) => item.slug === body?.contractSlug);
  if (!description && !reference)
    return Response.json(
      { error: 'Hãy mô tả yêu cầu hoặc tải tệp tham khảo.' },
      { status: 400 },
    );
  const fallback = `PHIẾU YÊU CẦU SOẠN THẢO\n\nLoại văn bản: ${
    selected?.title || 'Hợp đồng ví điện tử'
  }\nYêu cầu: ${description || 'Chỉnh sửa theo tệp tham khảo'}\n\nNỘI DUNG CẦN XÁC NHẬN\n- Chủ thể và thẩm quyền ký;\n- Phạm vi giấy phép và luồng tiền;\n- Phí, nghiệm thu, đối soát và SLA;\n- KYC/AML, dữ liệu và bảo mật;\n- Trách nhiệm, chấm dứt và tranh chấp.\n\nĐây là chế độ dữ liệu mẫu. Hãy dùng biểu mẫu theo mẫu để tạo dự thảo đầy đủ.`;
  const prompt = `${legalSystemRule}\n\nSoạn dự thảo ${
    selected?.title || 'hợp đồng phục vụ ví điện tử'
  } bằng tiếng Việt, có quốc hiệu, thông tin chủ thể để trống trong ngoặc vuông, căn cứ tham chiếu, điều khoản đánh số, chữ ký và lưu ý cần rà soát. Chỉ đưa điều khoản gắn trực tiếp với ví điện tử; không tự điền giấy phép, giá hoặc dữ kiện chưa được cung cấp.\n\nYêu cầu người dùng:\n${description}\n\nNội dung tham khảo nếu có:\n${reference}`;
  const result = await runLegalAI(prompt, fallback, 2200);
  return Response.json(result);
}
