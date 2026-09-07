'use client';

import { useMemo, useRef, useState, type SubmitEvent } from 'react';
import {
  Check,
  Clipboard,
  Download,
  FileSignature,
  ShieldCheck,
} from 'lucide-react';
import { contracts } from '@/lib/site-data';
import { contractReportContent } from '@/lib/contract-report-content';
import { downloadLegalDocx } from '@/lib/download-docx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';

const availableContracts = contracts.filter(
  (item) => contractReportContent[item.slug],
);

type FormState = {
  requesterName: string;
  contractSlug: string;
  providerName: string;
  providerCode: string;
  providerRepresentative: string;
  providerRole: string;
  partnerName: string;
  partnerCode: string;
  partnerAddress: string;
  fee: string;
  term: string;
};

const initialState: FormState = {
  requesterName: '',
  contractSlug: 'tich-hop-api-vi-dien-tu',
  providerName: 'Công ty Cổ phần Ví Thịnh Vượng',
  providerCode: '',
  providerRepresentative: '',
  providerRole: 'Tổng giám đốc',
  partnerName: '',
  partnerCode: '',
  partnerAddress: '',
  fee: '',
  term: '12 tháng kể từ ngày ký',
};

function field(value: string, fallback: string) {
  return value.trim() || `[${fallback}]`;
}

function cleanFileName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export function ContractBuilder({
  initialContractSlug,
}: {
  initialContractSlug?: string;
}) {
  const validInitialSlug =
    initialContractSlug &&
    availableContracts.some((item) => item.slug === initialContractSlug)
      ? initialContractSlug
      : initialState.contractSlug;
  const [form, setForm] = useState<FormState>({
    ...initialState,
    contractSlug: validInitialSlug,
  });
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLElement>(null);

  const selected =
    availableContracts.find((item) => item.slug === form.contractSlug) ??
    availableContracts[0]!;
  const draft = useMemo(() => {
    const now = new Date();
    const date = now.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const bases = selected.legalBases.map((law) => `- ${law};`).join('\n');
    const clauses = selected.clauses
      .map((clause, index) => `${index + 1}. ${clause}.`)
      .join('\n');
    return `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc

DỰ THẢO ${selected.title.toLocaleUpperCase('vi')}
Số: TV-${now.getFullYear()}-[SỐ HỢP ĐỒNG]

Hôm nay, ngày ${date}, trên cơ sở nhu cầu hợp tác và các quy định pháp luật hiện hành, các bên gồm:

BÊN A – DOANH NGHIỆP CUNG ỨNG DỊCH VỤ VÍ ĐIỆN TỬ
Tên doanh nghiệp: ${field(form.providerName, 'TÊN DOANH NGHIỆP')}
Mã số doanh nghiệp: ${field(form.providerCode, 'MÃ SỐ DOANH NGHIỆP')}
Đại diện: ${field(form.providerRepresentative, 'HỌ TÊN NGƯỜI ĐẠI DIỆN')}
Chức vụ: ${field(form.providerRole, 'CHỨC VỤ')}

BÊN B – KHÁCH HÀNG/ĐỐI TÁC
Tên cá nhân hoặc tổ chức: ${field(form.partnerName, 'TÊN KHÁCH HÀNG HOẶC ĐỐI TÁC')}
CCCD/Mã số doanh nghiệp: ${field(form.partnerCode, 'THÔNG TIN ĐỊNH DANH')}
Địa chỉ: ${field(form.partnerAddress, 'ĐỊA CHỈ')}

Người yêu cầu lập dự thảo: ${field(form.requesterName, 'HỌ TÊN NHÀ ĐẦU TƯ')}

CĂN CỨ THAM CHIẾU
${bases}

ĐIỀU 1. ĐỐI TƯỢNG VÀ PHẠM VI HỢP ĐỒNG
1. Bên A cung cấp ${selected.title.toLocaleLowerCase('vi')} cho Bên B theo phạm vi giấy phép hoạt động, quy trình nghiệp vụ và tài liệu kỹ thuật được hai bên thống nhất.
2. Đối tượng áp dụng dự kiến: ${selected.audience}
3. Mục tiêu kiểm soát: ${selected.solves}
4. Hợp đồng không trao cho Bên B quyền thực hiện nghiệp vụ thuộc phạm vi độc quyền của tổ chức cung ứng dịch vụ trung gian thanh toán nếu pháp luật hoặc giấy phép không cho phép.

ĐIỀU 2. NỘI DUNG CÔNG VIỆC VÀ TÀI LIỆU KÈM THEO
${clauses}
Các phụ lục về phạm vi nghiệp vụ, luồng tiền, dữ liệu, tiêu chuẩn kỹ thuật, mức dịch vụ, phí và đối soát là bộ phận không tách rời của hợp đồng.

ĐIỀU 3. PHÍ DỊCH VỤ VÀ THANH TOÁN
1. Phí dịch vụ dự kiến: ${field(form.fee, 'MỨC PHÍ/PHƯƠNG PHÁP TÍNH PHÍ')}.
2. Chu kỳ đối soát, thời điểm xuất hóa đơn, nghĩa vụ thuế và điều kiện tạm giữ hoặc điều chỉnh thanh toán phải được quy định tại phụ lục phí.
3. Không bên nào được tự ý khấu trừ, giữ lại hoặc sử dụng tiền của khách hàng trái quy định pháp luật và thỏa thuận hợp lệ.

ĐIỀU 4. QUYỀN, NGHĨA VỤ VÀ GIỚI HẠN TRÁCH NHIỆM
1. Mỗi bên chịu trách nhiệm về thông tin, hệ thống, nhân sự và quyết định thuộc phạm vi kiểm soát của mình.
2. Bên A duy trì phạm vi cung ứng phù hợp với giấy phép; Bên B sử dụng dịch vụ đúng mục đích và không thực hiện giao dịch bị cấm.
3. Việc giới hạn trách nhiệm không loại trừ nghĩa vụ bắt buộc về bảo vệ khách hàng, bảo mật, dữ liệu cá nhân, phòng, chống rửa tiền và bồi thường do lỗi cố ý hoặc vi phạm pháp luật.

ĐIỀU 5. DỮ LIỆU, BẢO MẬT VÀ AN TOÀN HỆ THỐNG
1. Dữ liệu chỉ được xử lý đúng mục đích, phạm vi và thời hạn đã thông báo hoặc được pháp luật cho phép.
2. Quyền truy cập phải được phân quyền, ghi nhật ký và thu hồi khi không còn cần thiết.
3. Bên phát hiện sự cố phải thông báo cho bên còn lại, bảo toàn chứng cứ và phối hợp xử lý theo thời hạn trong phụ lục phản ứng sự cố.

ĐIỀU 6. TRA SOÁT, ĐỐI SOÁT VÀ XỬ LÝ SỰ CỐ
1. Các bên thống nhất đầu mối, dữ liệu đối chiếu, thời hạn phản hồi và cơ chế xử lý giao dịch lỗi, hoàn tiền hoặc khiếu nại.
2. Kết quả đối soát phải có chứng cứ điện tử và được lưu giữ theo thời hạn áp dụng.
3. Biện pháp tạm khóa, phong tỏa hoặc từ chối giao dịch chỉ được áp dụng khi có căn cứ hợp đồng và căn cứ pháp luật.

ĐIỀU 7. THỜI HẠN, TẠM NGỪNG VÀ CHẤM DỨT
1. Thời hạn hợp đồng: ${field(form.term, 'THỜI HẠN')}.
2. Hợp đồng có thể bị tạm ngừng hoặc chấm dứt khi một bên vi phạm nghiêm trọng, mất điều kiện pháp lý, gây rủi ro an toàn hệ thống hoặc theo yêu cầu của cơ quan có thẩm quyền.
3. Khi chấm dứt, các bên phải hoàn tất đối soát, hoàn trả hoặc xóa dữ liệu theo căn cứ hợp lệ, thu hồi quyền truy cập và tiếp tục thực hiện các nghĩa vụ còn hiệu lực.

ĐIỀU 8. GIẢI QUYẾT TRANH CHẤP VÀ HIỆU LỰC
1. Tranh chấp được ưu tiên giải quyết bằng thương lượng; nếu không thành, các bên lựa chọn Tòa án hoặc Trọng tài có thẩm quyền tại phụ lục thông tin giao dịch.
2. Dự thảo chỉ có giá trị khi được các bên rà soát, điền đủ thông tin, thống nhất phụ lục và ký bởi người có thẩm quyền.

ĐẠI DIỆN BÊN A                                      ĐẠI DIỆN BÊN B
(Ký, ghi rõ họ tên)                                  (Ký, ghi rõ họ tên)

LƯU Ý: Đây là bản dự thảo hỗ trợ học tập, được tạo tự động từ thông tin người dùng nhập. Văn bản chưa phải hợp đồng sẵn sàng ký và cần được luật sư rà soát theo giấy phép, hồ sơ KYC, luồng tiền, dữ liệu và giao dịch thực tế.`;
  }, [form, selected]);

  const ready = Boolean(
    form.requesterName.trim() &&
    form.providerName.trim() &&
    form.partnerName.trim(),
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setGenerated(false);
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready) return;
    setGenerated(true);
    window.setTimeout(
      () =>
        previewRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        }),
      80,
    );
  }

  async function copyDraft() {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function downloadWord() {
    await downloadLegalDocx(
      `du-thao-${cleanFileName(selected.shortTitle)}`,
      draft,
    );
  }

  return (
    <div className="contract-builder-layout">
      <form className="builder-form" onSubmit={submit}>
        <div className="builder-step">
          <span>01</span>
          <div>
            <h2>Chọn hợp đồng và người yêu cầu</h2>
            <p>
              Tên nhà đầu tư được ghi nhận trên bản dự thảo để quản lý hồ sơ.
            </p>
          </div>
        </div>
        <div className="builder-fields">
          <div className="builder-field builder-field-wide">
            <Label htmlFor="contractSlug">Loại hợp đồng</Label>
            <NativeSelect
              className="builder-select"
              id="contractSlug"
              value={form.contractSlug}
              onChange={(event) => update('contractSlug', event.target.value)}
            >
              {availableContracts.map((item) => (
                <NativeSelectOption key={item.slug} value={item.slug}>
                  {item.title}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <div className="builder-field builder-field-wide">
            <Label htmlFor="requesterName">Họ và tên nhà đầu tư *</Label>
            <Input
              id="requesterName"
              value={form.requesterName}
              onChange={(event) => update('requesterName', event.target.value)}
              placeholder="Ví dụ: Vũ Anh Quân"
              required
            />
          </div>
        </div>

        <div className="builder-step">
          <span>02</span>
          <div>
            <h2>Thông tin doanh nghiệp ví điện tử</h2>
            <p>
              Bên cung ứng phải phù hợp với chủ thể và phạm vi giấy phép thực
              tế.
            </p>
          </div>
        </div>
        <div className="builder-fields">
          <div className="builder-field builder-field-wide">
            <Label htmlFor="providerName">Tên doanh nghiệp *</Label>
            <Input
              id="providerName"
              value={form.providerName}
              onChange={(event) => update('providerName', event.target.value)}
              required
            />
          </div>
          <div className="builder-field">
            <Label htmlFor="providerCode">Mã số doanh nghiệp</Label>
            <Input
              id="providerCode"
              value={form.providerCode}
              onChange={(event) => update('providerCode', event.target.value)}
              placeholder="Nhập mã số doanh nghiệp"
            />
          </div>
          <div className="builder-field">
            <Label htmlFor="providerRepresentative">Người đại diện</Label>
            <Input
              id="providerRepresentative"
              value={form.providerRepresentative}
              onChange={(event) =>
                update('providerRepresentative', event.target.value)
              }
              placeholder="Họ và tên"
            />
          </div>
          <div className="builder-field builder-field-wide">
            <Label htmlFor="providerRole">Chức vụ</Label>
            <Input
              id="providerRole"
              value={form.providerRole}
              onChange={(event) => update('providerRole', event.target.value)}
            />
          </div>
        </div>

        <div className="builder-step">
          <span>03</span>
          <div>
            <h2>Thông tin khách hàng hoặc đối tác</h2>
            <p>Thông tin này được đưa vào phần chủ thể của hợp đồng.</p>
          </div>
        </div>
        <div className="builder-fields">
          <div className="builder-field builder-field-wide">
            <Label htmlFor="partnerName">Tên cá nhân hoặc tổ chức *</Label>
            <Input
              id="partnerName"
              value={form.partnerName}
              onChange={(event) => update('partnerName', event.target.value)}
              placeholder="Tên khách hàng hoặc đối tác"
              required
            />
          </div>
          <div className="builder-field">
            <Label htmlFor="partnerCode">CCCD/Mã số doanh nghiệp</Label>
            <Input
              id="partnerCode"
              value={form.partnerCode}
              onChange={(event) => update('partnerCode', event.target.value)}
            />
          </div>
          <div className="builder-field">
            <Label htmlFor="partnerAddress">Địa chỉ</Label>
            <Input
              id="partnerAddress"
              value={form.partnerAddress}
              onChange={(event) => update('partnerAddress', event.target.value)}
            />
          </div>
          <div className="builder-field">
            <Label htmlFor="fee">Phí dịch vụ</Label>
            <Input
              id="fee"
              value={form.fee}
              onChange={(event) => update('fee', event.target.value)}
              placeholder="Ví dụ: Theo biểu phí tại Phụ lục 02"
            />
          </div>
          <div className="builder-field">
            <Label htmlFor="term">Thời hạn</Label>
            <Input
              id="term"
              value={form.term}
              onChange={(event) => update('term', event.target.value)}
            />
          </div>
        </div>
        <div className="builder-privacy">
          <ShieldCheck />
          <span>
            Dữ liệu biểu mẫu được xử lý ngay trên trình duyệt và không được gửi
            lên máy chủ khi tạo bản dự thảo.
          </span>
        </div>
        <Button
          className="builder-submit"
          size="lg"
          type="submit"
          disabled={!ready}
        >
          <FileSignature /> Tạo bản dự thảo
        </Button>
      </form>

      <section
        className={`builder-preview ${generated ? 'is-generated' : ''}`}
        ref={previewRef}
        aria-live="polite"
      >
        <div className="builder-preview-header">
          <div>
            <span>Bản xem trước</span>
            <strong>{selected.shortTitle}</strong>
          </div>
          <div className="builder-preview-actions">
            <Button variant="outline" type="button" onClick={copyDraft}>
              <Clipboard />
              {copied ? 'Đã sao chép' : 'Sao chép'}
            </Button>
            <Button type="button" onClick={downloadWord} disabled={!generated}>
              <Download />
              Tải bản Word
            </Button>
          </div>
        </div>
        {!generated && (
          <div className="builder-preview-notice">
            Điền ba trường có dấu (*) rồi chọn “Tạo bản dự thảo”.
          </div>
        )}
        {generated && (
          <div className="builder-success">
            <Check />
            Bản dự thảo đã được tạo. Hãy kiểm tra các trường còn để trong ngoặc
            vuông.
          </div>
        )}
        <pre>{draft}</pre>
      </section>
    </div>
  );
}
