"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Download,
  ExternalLink,
  FilePlus2,
  FileSearch,
  FileSignature,
  Files,
  FolderKanban,
  GitCompareArrows,
  LoaderCircle,
  LockKeyhole,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useRef, useState, type SyntheticEvent } from "react";
import {
  useDemoSession,
  type DemoFile,
} from "@/components/demo-session-provider";
import { downloadLegalDocx } from "@/lib/download-docx";
import { formatFileSize, readLegalDocument } from "@/lib/client-document";
import {
  demoChapters,
  platformSources,
  platformStats,
  reviewPlaybook,
  sampleQuestions,
} from "@/lib/platform-data";
import { contracts } from "@/lib/site-data";
import { useCustomerName } from "@/hooks/use-customer-name";

type Tool =
  | "tong-quan"
  | "hoi-dap"
  | "tao-hop-dong"
  | "review"
  | "so-sanh"
  | "ho-so"
  | "tep";
type ToolResponse = { text?: string; mode?: "ai" | "demo"; error?: string };
type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  citationSourceIds?: string[];
};

function relatesToWallet(text: string) {
  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return /vi dien tu|e-wallet|trung gian thanh toan|api|webhook|kyc|aml|doi soat|tai khoan bao dam/.test(
    normalized,
  );
}

const toolMeta: Record<Tool, [string, string]> = {
  "tong-quan": [
    "Trung tâm pháp lý ví điện tử",
    "Làm việc trực tiếp với bộ hồ sơ sáu chương, hợp đồng và nguồn luật đã chọn lọc.",
  ],
  "hoi-dap": [
    "Hỏi đáp pháp luật",
    "Hỏi các lĩnh vực pháp luật Việt Nam; ví điện tử là kho kiến thức chuyên sâu nhất.",
  ],
  "tao-hop-dong": [
    "Tạo hợp đồng pháp lý",
    "Bắt đầu từ mẫu, mô tả yêu cầu hoặc một văn bản tham khảo.",
  ],
  review: [
    "Review hợp đồng",
    "Nhận diện điều khoản thiếu, rủi ro và phương án sửa trong bối cảnh ví điện tử.",
  ],
  "so-sanh": [
    "So sánh hợp đồng",
    "Đối chiếu hai phiên bản và đánh giá thay đổi làm tăng hay giảm rủi ro.",
  ],
  "ho-so": [
    "Bộ hồ sơ sáu chương",
    "Theo dõi tài liệu tối thiểu, tài liệu bổ sung và căn cứ của dự án.",
  ],
  tep: [
    "Quản lý tệp trong phiên",
    "Tệp không được lưu vào tài khoản hoặc cơ sở dữ liệu của website.",
  ],
};

function ToolHeader({ tool }: { tool: Tool }) {
  const [title, description] = toolMeta[tool];
  return (
    <header className="tool-header">
      <div>
        <span className="tool-kicker">THỊNH VƯỢNG LEGAL · DEMO</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="privacy-pill">
        <LockKeyhole />
        <span>
          <strong>Không lưu hồ sơ</strong>
          <small>Dữ liệu xóa khi kết thúc phiên</small>
        </span>
      </div>
    </header>
  );
}

function DocumentPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: DemoFile;
  onChange: (file: DemoFile) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { addFile } = useDemoSession();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function pick(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const parsed = await readLegalDocument(file);
      addFile(parsed);
      onChange(parsed);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Không đọc được tệp.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="document-picker">
      <span className="document-picker-label">{label}</span>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept=".pdf,.docx"
        onChange={(event) => pick(event.target.files?.[0])}
      />
      <button
        type="button"
        className="drop-zone"
        onClick={() => inputRef.current?.click()}
      >
        {busy ? (
          <LoaderCircle className="spin" />
        ) : value ? (
          <FileSearch />
        ) : (
          <UploadCloud />
        )}
        <strong>
          {busy ? "Đang đọc tệp…" : value?.name || "Chọn PDF hoặc DOCX"}
        </strong>
        <span>
          {value
            ? `${formatFileSize(value.size)} · đã đọc ${value.text.length.toLocaleString("vi-VN")} ký tự`
            : "Tối đa 20 MB · nội dung xử lý tạm thời"}
        </span>
      </button>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function SourceSelector({
  selected,
  setSelected,
}: {
  selected: string[];
  setSelected: (value: string[]) => void;
}) {
  return (
    <details className="source-selector">
      <summary>
        <ShieldCheck /> Nguồn luật áp dụng <span>{selected.length}/10</span>
      </summary>
      <div className="source-selector-list">
        {platformSources.map((source) => (
          <label key={source.id}>
            <input
              aria-label={source.title}
              type="checkbox"
              checked={selected.includes(source.id)}
              onChange={(event) => {
                if (event.target.checked && selected.length >= 10) return;
                setSelected(
                  event.target.checked
                    ? [...selected, source.id]
                    : selected.filter((id) => id !== source.id),
                );
              }}
            />
            <span>
              <strong>{source.title}</strong>
              <small>
                {source.status} · kiểm tra {source.lastChecked}
              </small>
            </span>
          </label>
        ))}
      </div>
    </details>
  );
}

function Dashboard() {
  const tools = [
    [
      "Hỏi đáp theo nguồn",
      "Chọn luật và hỏi trong bộ hồ sơ ví điện tử.",
      "/cong-cu/hoi-dap",
      Bot,
    ],
    [
      "Tạo hợp đồng",
      "Dùng 20 mẫu hoặc mô tả yêu cầu riêng.",
      "/cong-cu/tao-hop-dong",
      FileSignature,
    ],
    [
      "Review hợp đồng",
      "Phân loại đỏ, vàng, xanh và đề xuất sửa.",
      "/cong-cu/review",
      ClipboardCheck,
    ],
    [
      "So sánh phiên bản",
      "Đọc khác biệt nguyên văn và tác động pháp lý.",
      "/cong-cu/so-sanh",
      GitCompareArrows,
    ],
    [
      "Hồ sơ sáu chương",
      "Đi từ mô hình đến xử lý sự cố.",
      "/cong-cu/ho-so",
      FolderKanban,
    ],
    [
      "Quản lý tệp",
      "Dùng lại tài liệu trong phiên hiện tại.",
      "/cong-cu/tep",
      Files,
    ],
  ] as const;
  return (
    <>
      <ToolHeader tool="tong-quan" />
      <section className="platform-stats">
        <div>
          <strong>{platformStats.chapters}</strong>
          <span>chương dịch vụ</span>
        </div>
        <div>
          <strong>{platformStats.contracts}</strong>
          <span>hợp đồng và hồ sơ</span>
        </div>
        <div>
          <strong>{platformStats.sources}</strong>
          <span>nguồn chính thức</span>
        </div>
        <div>
          <strong>{platformStats.minimum}</strong>
          <span>tài liệu tối thiểu (*)</span>
        </div>
      </section>
      <section className="tool-grid">
        {tools.map(([title, description, href, Icon]) => (
          <Link href={href} className="tool-card" key={href}>
            <span>
              <Icon />
            </span>
            <h2>{title}</h2>
            <p>{description}</p>
            <strong>
              Mở công cụ <ArrowRight />
            </strong>
          </Link>
        ))}
      </section>
      <section className="workspace-preview">
        <div>
          <span className="tool-kicker">KHÔNG GIAN MẪU</span>
          <h2>Bộ hồ sơ pháp lý doanh nghiệp ví điện tử</h2>
          <p>
            Sáu chương được nối với 20 hợp đồng, chính sách và quy trình từ báo
            cáo tổng hợp.
          </p>
        </div>
        <Link href="/cong-cu/ho-so">
          Mở hồ sơ <ArrowRight />
        </Link>
      </section>
    </>
  );
}

function FullChat() {
  const { files } = useDemoSession();
  const { name, ready, remember } = useCustomerName();
  const [nameInput, setNameInput] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [fileId, setFileId] = useState("");
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [responseMode, setResponseMode] = useState<"ai" | "demo" | "">("");
  const [selectedSources, setSelectedSources] = useState(
    platformSources.slice(0, 4).map((x) => x.id),
  );
  const selectedFile = files.find((file) => file.id === fileId);

  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim() || pending) return;
    if (selectedFile && !consent) {
      setError("Cần xác nhận trước khi gửi nội dung tệp tới AI.");
      return;
    }
    const question = input.trim();
    const walletContext = relatesToWallet(
      `${question}\n${selectedFile?.text.slice(0, 2000) || ""}`,
    );
    const citationSourceIds = walletContext ? [...selectedSources] : [];
    setMessages((old) => [...old, { role: "user", text: question }]);
    setInput("");
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/legal-assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: question,
          selectedText: selectedFile?.text,
          sources: citationSourceIds,
          customerName: name,
        }),
      });
      if (!response.ok || !response.body) {
        const payload = (await response
          .json()
          .catch(() => ({}))) as ToolResponse;
        throw new Error(payload.error || "Không thể trả lời lúc này.");
      }
      setResponseMode(
        response.headers.get("x-ai-mode") === "ai" ? "ai" : "demo",
      );
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let answer = "";
      setMessages((old) => [
        ...old,
        { role: "assistant", text: "", citationSourceIds },
      ]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";
        for (const block of blocks) {
          const line = block
            .split("\n")
            .find((item) => item.startsWith("data: "));
          if (!line || line === "data: [DONE]") continue;
          const data = JSON.parse(line.slice(6));
          if (data.type === "response.output_text.delta") {
            answer += data.delta;
            const current = answer;
            setMessages((old) =>
              old.map((item, index) =>
                index === old.length - 1 ? { ...item, text: current } : item,
              ),
            );
          }
        }
      }
      if (!answer) throw new Error("Không nhận được nội dung trả lời.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Có lỗi khi hỏi AI.");
      setMessages((old) => old.filter((item) => item.text));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <ToolHeader tool="hoi-dap" />
      {ready && !name && (
        <section className="customer-name-gate">
          <span className="demo-avatar">TV</span>
          <div>
            <span className="tool-kicker">LẦN ĐẦU GẶP BẠN</span>
            <h2>Chúng tôi nên gọi bạn là gì?</h2>
            <p>
              Tên gọi được lưu trên trình duyệt này để trợ lý ghi nhớ ở lần sau.
              Không cần tài khoản.
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                remember(nameInput);
              }}
            >
              <input
                value={nameInput}
                maxLength={60}
                onChange={(event) => setNameInput(event.target.value)}
                placeholder="Nhập tên của bạn"
                aria-label="Tên khách hàng"
              />
              <button disabled={!nameInput.trim()}>
                Ghi nhớ tên <ArrowRight />
              </button>
            </form>
          </div>
        </section>
      )}
      <div className="chat-workspace">
        <section className="chat-panel">
          <div className="chat-messages">
            {!messages.length && (
              <div className="chat-empty">
                <Bot />
                <h2>
                  {name
                    ? `Chào ${name}, bạn cần làm rõ vấn đề nào?`
                    : "Bạn cần làm rõ vấn đề nào?"}
                </h2>
                <p>
                  Trợ lý giải thích pháp luật Việt Nam bằng văn phong luật học
                  dễ hiểu; ví điện tử là lĩnh vực có dữ liệu chuyên sâu.
                </p>
                <div>
                  {sampleQuestions.map((q) => (
                    <button type="button" key={q} onClick={() => setInput(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <article
                className={`chat-bubble ${message.role}`}
                key={`${message.role}-${index}`}
              >
                {message.text || <LoaderCircle className="spin" />}
                {message.role === "assistant" &&
                  message.text &&
                  Boolean(message.citationSourceIds?.length) && (
                    <div className="chat-citations">
                      <strong>Nguồn đang áp dụng</strong>
                      {platformSources
                        .filter((source) =>
                          message.citationSourceIds?.includes(source.id),
                        )
                        .map((source) => (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            key={source.id}
                          >
                            {source.title}
                            <ExternalLink />
                          </a>
                        ))}
                    </div>
                  )}
              </article>
            ))}
          </div>
          <form className="full-chat-form" onSubmit={submit}>
            <textarea
              maxLength={5000}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Nhập câu hỏi pháp luật của bạn…"
              disabled={!name}
            />
            <div className="chat-form-row">
              <select
                value={fileId}
                onChange={(event) => {
                  setFileId(event.target.value);
                  setConsent(false);
                }}
              >
                <option value="">Không dùng tệp</option>
                {files.map((file) => (
                  <option value={file.id} key={file.id}>
                    @ {file.name}
                  </option>
                ))}
              </select>
              <button disabled={!name || pending || !input.trim()}>
                {pending ? <LoaderCircle className="spin" /> : <ArrowRight />}{" "}
                Gửi câu hỏi
              </button>
            </div>
            {selectedFile && (
              <label className="consent-line">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />{" "}
                Tôi đồng ý gửi tạm nội dung tệp này tới dịch vụ AI để phân tích;
                website không lưu hồ sơ.
              </label>
            )}
            {error && <p className="field-error">{error}</p>}
          </form>
        </section>
        <aside className="chat-sources">
          {responseMode && (
            <div className={`assistant-status ${responseMode}`}>
              <span>
                {responseMode === "ai"
                  ? "AI đang hoạt động"
                  : "Chế độ dữ liệu mẫu"}
              </span>
              <small>
                {responseMode === "ai"
                  ? "Yêu cầu dùng chế độ không lưu"
                  : "Chưa có khóa AI trong môi trường này"}
              </small>
            </div>
          )}
          <SourceSelector
            selected={selectedSources}
            setSelected={setSelectedSources}
          />
          <Link href="/cong-cu/tep">
            <FilePlus2 /> Thêm tệp vào phiên
          </Link>
          <div className="legal-boundary">
            <ShieldCheck />
            <p>
              Phản hồi phục vụ học tập và chuẩn bị hồ sơ; không phải ý kiến pháp
              lý cho vụ việc cụ thể.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function DraftTool() {
  const { files } = useDemoSession();
  const [mode, setMode] = useState<"template" | "describe" | "edit">(
    "template",
  );
  const [contractSlug, setContractSlug] = useState("tich-hop-api-vi-dien-tu");
  const [description, setDescription] = useState("");
  const [fileId, setFileId] = useState("");
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState("");
  const [aiMode, setAiMode] = useState<"ai" | "demo" | "">("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const selected =
    contracts.find((item) => item.slug === contractSlug) || contracts[0];
  const selectedFile = files.find((item) => item.id === fileId);
  async function generate() {
    if (selectedFile && !consent) {
      setError("Cần xác nhận trước khi gửi nội dung tệp tới AI.");
      return;
    }
    setPending(true);
    setError("");
    setResult("");
    try {
      const response = await fetch("/api/contract-draft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          description,
          referenceText: selectedFile?.text,
          contractSlug,
        }),
      });
      const payload = (await response.json()) as ToolResponse;
      if (!response.ok) throw new Error(payload.error);
      setResult(payload.text || "");
      setAiMode(payload.mode || "demo");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Không thể tạo dự thảo.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <ToolHeader tool="tao-hop-dong" />
      <div className="mode-tabs" role="tablist">
        {(
          [
            ["template", "Dùng mẫu"],
            ["describe", "Tạo từ yêu cầu"],
            ["edit", "Sửa bản sẵn"],
          ] as const
        ).map(([id, label]) => (
          <button
            role="tab"
            aria-selected={mode === id}
            className={mode === id ? "active" : ""}
            key={id}
            onClick={() => {
              setMode(id);
              setResult("");
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === "template" ? (
        <section className="template-workspace">
          <div className="template-picker">
            <label>
              Loại hợp đồng
              <select
                value={contractSlug}
                onChange={(e) => setContractSlug(e.target.value)}
              >
                {contracts.map((item) => (
                  <option value={item.slug} key={item.slug}>
                    {item.title}
                    {item.minimum ? " (*)" : ""}
                  </option>
                ))}
              </select>
            </label>
            <article>
              <span
                className={`tier ${selected.minimum ? "minimum" : "advanced"}`}
              >
                {selected.minimum ? "Tối thiểu (*)" : "Bổ sung"}
              </span>
              <h2>{selected.title}</h2>
              <p>{selected.summary}</p>
              <ul>
                {selected.clauses.map((clause) => (
                  <li key={clause}>
                    <CheckCircle2 />
                    {clause}
                  </li>
                ))}
              </ul>
              <Link
                className="platform-primary"
                href={`/tao-hop-dong?mau=${selected.slug}`}
              >
                Điền biểu mẫu chi tiết <ArrowRight />
              </Link>
            </article>
          </div>
        </section>
      ) : (
        <section className="draft-workspace">
          <div className="draft-form">
            <label>
              Loại hợp đồng
              <select
                value={contractSlug}
                onChange={(e) => setContractSlug(e.target.value)}
              >
                {contracts.map((item) => (
                  <option value={item.slug} key={item.slug}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            {mode === "edit" && (
              <label>
                Tệp đã thêm
                <select
                  value={fileId}
                  onChange={(e) => {
                    setFileId(e.target.value);
                    setConsent(false);
                  }}
                >
                  <option value="">Chọn tệp trong phiên</option>
                  {files.map((file) => (
                    <option value={file.id} key={file.id}>
                      {file.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              Yêu cầu
              <textarea
                value={description}
                maxLength={5000}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  mode === "edit"
                    ? "Ví dụ: giữ nguyên cách hành văn, sửa phạm vi dịch vụ API…"
                    : "Mô tả chủ thể, mục tiêu, phạm vi và yêu cầu đặc biệt…"
                }
              />
            </label>
            {selectedFile && (
              <label className="consent-line">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />{" "}
                Tôi đồng ý gửi tạm nội dung tệp tới AI.
              </label>
            )}
            <button
              className="platform-primary"
              type="button"
              disabled={pending || (!description.trim() && !selectedFile)}
              onClick={generate}
            >
              {pending ? <LoaderCircle className="spin" /> : <Bot />} Tạo dự
              thảo
            </button>
            {error && <p className="field-error">{error}</p>}
          </div>
          <div className="result-document">
            {result ? (
              <>
                <div className="result-toolbar">
                  <span className={`mode-badge ${aiMode}`}>
                    {aiMode === "ai"
                      ? "AI đang hoạt động"
                      : "Chế độ dữ liệu mẫu"}
                  </span>
                  <button
                    onClick={() =>
                      downloadLegalDocx(selected.shortTitle, result)
                    }
                  >
                    <Download /> Tải DOCX
                  </button>
                </div>
                <pre>{result}</pre>
              </>
            ) : (
              <div className="result-empty">
                <FileSignature />
                <h2>Dự thảo sẽ xuất hiện tại đây</h2>
                <p>
                  Thông tin chưa có sẽ được để trong ngoặc vuông để tiếp tục xác
                  nhận.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}

function ReviewTool() {
  const [file, setFile] = useState<DemoFile>();
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState("");
  const [mode, setMode] = useState("");
  const [error, setError] = useState("");
  const [sources, setSources] = useState(
    platformSources.slice(0, 4).map((x) => x.id),
  );
  async function review() {
    if (!file || !consent) {
      setError("Hãy chọn tệp và xác nhận việc gửi nội dung tới AI.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/contract-review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text: file.text,
          fileName: file.name,
          sources: platformSources
            .filter((x) => sources.includes(x.id))
            .map((x) => x.title),
        }),
      });
      const payload = (await response.json()) as ToolResponse;
      if (!response.ok) throw new Error(payload.error);
      setResult(payload.text || "");
      setMode(payload.mode || "demo");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể review.");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <ToolHeader tool="review" />
      <div className="analysis-layout">
        <section className="analysis-input">
          <DocumentPicker
            label="Hợp đồng cần review"
            value={file}
            onChange={(value) => {
              setFile(value);
              setConsent(false);
              setResult("");
            }}
          />
          <SourceSelector selected={sources} setSelected={setSources} />
          <label className="consent-line">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />{" "}
            Tôi đồng ý gửi tạm nội dung đã trích xuất tới AI; website không lưu
            tệp.
          </label>
          <button
            className="platform-primary"
            disabled={!file || pending}
            onClick={review}
          >
            {pending ? <LoaderCircle className="spin" /> : <ClipboardCheck />}{" "}
            Bắt đầu review
          </button>
          {error && <p className="field-error">{error}</p>}
          <details className="review-playbook">
            <summary>Tiêu chí rà soát</summary>
            <ol>
              {reviewPlaybook.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </details>
        </section>
        <section className="analysis-result">
          {result ? (
            <>
              <div className="result-toolbar">
                <span className={`mode-badge ${mode}`}>
                  {mode === "ai" ? "AI đang hoạt động" : "Chế độ dữ liệu mẫu"}
                </span>
                <button
                  onClick={() =>
                    downloadLegalDocx(
                      `Bao-cao-review-${file?.name || "hop-dong"}`,
                      result,
                    )
                  }
                >
                  <Download />
                  Tải báo cáo
                </button>
              </div>
              <pre>{result}</pre>
            </>
          ) : (
            <div className="result-empty">
              <ClipboardCheck />
              <h2>Chưa có kết quả review</h2>
              <p>
                Kết quả sẽ phân nhóm đỏ, vàng, xanh và nêu thông tin còn thiếu.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function CompareTool() {
  const [left, setLeft] = useState<DemoFile>();
  const [right, setRight] = useState<DemoFile>();
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState("");
  const [mode, setMode] = useState("");
  const [error, setError] = useState("");
  async function compare() {
    if (!left || !right || !consent) {
      setError("Cần hai tệp và xác nhận trước khi so sánh.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/contract-compare", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          left: left.text,
          right: right.text,
          leftName: left.name,
          rightName: right.name,
        }),
      });
      const payload = (await response.json()) as ToolResponse;
      if (!response.ok) throw new Error(payload.error);
      setResult(payload.text || "");
      setMode(payload.mode || "demo");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể so sánh.");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <ToolHeader tool="so-sanh" />
      <section className="compare-inputs">
        <DocumentPicker label="Hợp đồng gốc" value={left} onChange={setLeft} />
        <div className="compare-mark">VS</div>
        <DocumentPicker
          label="Hợp đồng so sánh"
          value={right}
          onChange={setRight}
        />
      </section>
      <div className="compare-actions">
        <label className="consent-line">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />{" "}
          Tôi đồng ý gửi tạm nội dung hai tệp tới AI; website không lưu tệp.
        </label>
        <button
          className="platform-primary"
          disabled={!left || !right || pending}
          onClick={compare}
        >
          {pending ? <LoaderCircle className="spin" /> : <GitCompareArrows />}{" "}
          So sánh hai bản
        </button>
        {error && <p className="field-error">{error}</p>}
      </div>
      <section className="analysis-result compare-result">
        {result ? (
          <>
            <div className="result-toolbar">
              <span className={`mode-badge ${mode}`}>
                {mode === "ai" ? "AI đang hoạt động" : "Chế độ dữ liệu mẫu"}
              </span>
              <button
                onClick={() =>
                  downloadLegalDocx("Bao-cao-so-sanh-hop-dong", result)
                }
              >
                <Download />
                Tải báo cáo
              </button>
            </div>
            <pre>{result}</pre>
          </>
        ) : (
          <div className="result-empty">
            <GitCompareArrows />
            <h2>Chưa có kết quả so sánh</h2>
            <p>
              Hệ thống sẽ chỉ ra nội dung thêm, bỏ, sửa và tác động tới rủi ro.
            </p>
          </div>
        )}
      </section>
    </>
  );
}

function WorkspaceTool() {
  const [query, setQuery] = useState("");
  const filtered = demoChapters
    .map((chapter) => ({
      ...chapter,
      documents: chapter.documents.filter((item) =>
        `${item.title} ${item.summary}`
          .toLocaleLowerCase("vi")
          .includes(query.toLocaleLowerCase("vi")),
      ),
    }))
    .filter((chapter) => !query || chapter.documents.length);
  return (
    <>
      <ToolHeader tool="ho-so" />
      <div className="workspace-toolbar">
        <label>
          <Search />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm hợp đồng, quy trình hoặc chính sách…"
          />
        </label>
        <span>
          {demoChapters.length} chương · {contracts.length} tài liệu
        </span>
      </div>
      <section className="chapter-list">
        {filtered.map((chapter) => (
          <details key={chapter.id} open={chapter.number === 4}>
            <summary>
              <span>{String(chapter.number).padStart(2, "0")}</span>
              <div>
                <h2>
                  Chương {chapter.number}. {chapter.title}
                  {chapter.minimum ? " (*)" : ""}
                </h2>
                <p>{chapter.description}</p>
              </div>
              <strong>{chapter.documents.length} tài liệu</strong>
            </summary>
            <div className="chapter-documents">
              {chapter.documents.length ? (
                chapter.documents.map((item) => (
                  <Link href={`/hop-dong/${item.slug}`} key={item.slug}>
                    <span
                      className={`tier ${item.minimum ? "minimum" : "advanced"}`}
                    >
                      {item.minimum ? "Tối thiểu (*)" : "Bổ sung"}
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    <strong>
                      Xem nội dung <ArrowRight />
                    </strong>
                  </Link>
                ))
              ) : (
                <div className="chapter-empty">
                  Nội dung chương được trình bày trong báo cáo tổng hợp.
                </div>
              )}
            </div>
          </details>
        ))}
      </section>
    </>
  );
}

function FilesTool() {
  const { files, removeFile } = useDemoSession();
  const [picked, setPicked] = useState<DemoFile>();
  const [query, setQuery] = useState("");
  const filtered = files.filter((file) =>
    file.name.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")),
  );
  return (
    <>
      <ToolHeader tool="tep" />
      <div className="file-manager">
        <section>
          <DocumentPicker
            label="Thêm tệp vào phiên"
            value={picked}
            onChange={setPicked}
          />
          <div className="file-search">
            <Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên tệp…"
            />
          </div>
          <div className="file-list">
            {filtered.length ? (
              filtered.map((file) => (
                <div
                  className={`file-row ${picked?.id === file.id ? "active" : ""}`}
                  key={file.id}
                >
                  <button
                    className="file-select"
                    onClick={() => setPicked(file)}
                  >
                    <FileSearch />
                    <span>
                      <strong>{file.name}</strong>
                      <small>
                        {file.format.toUpperCase()} ·{" "}
                        {formatFileSize(file.size)} · {file.addedAt}
                      </small>
                    </span>
                  </button>
                  <button
                    className="file-delete"
                    aria-label={`Xóa ${file.name}`}
                    onClick={() => {
                      removeFile(file.id);
                      if (picked?.id === file.id) setPicked(undefined);
                    }}
                  >
                    <Trash2 />
                  </button>
                </div>
              ))
            ) : (
              <div className="result-empty compact">
                <Files />
                <h2>Chưa có tệp nào</h2>
                <p>
                  Tệp PDF hoặc DOCX sẽ xuất hiện ở đây trong phiên hiện tại.
                </p>
              </div>
            )}
          </div>
        </section>
        <aside className="file-preview">
          {picked ? (
            <>
              <div>
                <strong>{picked.name}</strong>
                <span>
                  {picked.text.length.toLocaleString("vi-VN")} ký tự đã trích
                  xuất
                </span>
              </div>
              <pre>{picked.text.slice(0, 12000)}</pre>
            </>
          ) : (
            <div className="result-empty">
              <FileSearch />
              <h2>Xem trước nội dung</h2>
              <p>Chọn một tệp để kiểm tra phần chữ đã trích xuất.</p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

export function LegalPlatform({ tool }: { tool: Tool }) {
  return (
    <main className="platform-content">
      {tool === "tong-quan" ? (
        <Dashboard />
      ) : tool === "hoi-dap" ? (
        <FullChat />
      ) : tool === "tao-hop-dong" ? (
        <DraftTool />
      ) : tool === "review" ? (
        <ReviewTool />
      ) : tool === "so-sanh" ? (
        <CompareTool />
      ) : tool === "ho-so" ? (
        <WorkspaceTool />
      ) : (
        <FilesTool />
      )}
    </main>
  );
}
