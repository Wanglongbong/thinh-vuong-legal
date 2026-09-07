'use client';

import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import {
  Bot,
  CornerDownLeft,
  LoaderCircle,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

type Message = { role: 'user' | 'assistant'; text: string };
const dailyKey = 'tv-legal-ai-usage';
const today = () => new Date().toISOString().slice(0, 10);
function readUsage() {
  if (typeof window === 'undefined') return 0;
  try {
    const saved = JSON.parse(localStorage.getItem(dailyKey) ?? '{}');
    return saved.date === today() ? Number(saved.count) || 0 : 0;
  } catch {
    return 0;
  }
}
function saveUsage(count: number) {
  localStorage.setItem(dailyKey, JSON.stringify({ date: today(), count }));
}

export function LegalAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [usage, setUsage] = useState(readUsage);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ask = (event: Event) => {
      setSelectedText((event as CustomEvent<string>).detail);
      setInput(
        'Hãy giải thích ý nghĩa pháp lý của đoạn được chọn đối với hoạt động ví điện tử.',
      );
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 150);
    };
    window.addEventListener('tv:ask-selection', ask);
    return () => window.removeEventListener('tv:ask-selection', ask);
  }, []);

  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || pending || usage >= 5) return;
    setMessages((old) => [...old, { role: 'user', text: message }]);
    setInput('');
    setPending(true);
    const next = usage + 1;
    setUsage(next);
    saveUsage(next);
    try {
      const response = await fetch('/api/legal-assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message,
          selectedText: selectedText || undefined,
        }),
      });
      if (!response.ok || !response.body) {
        const payload: unknown = await response.json().catch(() => ({}));
        const errorMessage =
          typeof payload === 'object' &&
          payload &&
          'error' in payload &&
          typeof payload.error === 'string'
            ? payload.error
            : 'Trợ lý chưa thể trả lời lúc này.';
        throw new Error(errorMessage);
      }
      setSelectedText('');
      setMessages((old) => [...old, { role: 'assistant', text: '' }]);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let answer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() ?? '';
        for (const block of blocks) {
          const dataLine = block
            .split('\n')
            .find((line) => line.startsWith('data: '));
          if (!dataLine || dataLine === 'data: [DONE]') continue;
          try {
            const eventData: unknown = JSON.parse(dataLine.slice(6));
            if (
              typeof eventData === 'object' &&
              eventData &&
              'type' in eventData &&
              eventData.type === 'response.output_text.delta' &&
              'delta' in eventData &&
              typeof eventData.delta === 'string'
            ) {
              answer += eventData.delta;
              const currentAnswer = answer;
              setMessages((old) =>
                old.map((item, index) =>
                  index === old.length - 1
                    ? { ...item, text: currentAnswer }
                    : item,
                ),
              );
            }
          } catch {
            /* bỏ qua sự kiện chưa hoàn chỉnh */
          }
        }
      }
      if (!answer) throw new Error('Không nhận được nội dung trả lời.');
    } catch (error) {
      console.error(error);
      setMessages((old) => {
        const last = old.at(-1);
        const fallback: Message = {
          role: 'assistant',
          text: 'Trợ lý chưa thể phản hồi lúc này. Vui lòng kiểm tra cấu hình hoặc thử lại sau.',
        };
        return last?.role === 'assistant' && !last.text
          ? [...old.slice(0, -1), fallback]
          : [...old, fallback];
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="ai-trigger" aria-label="Mở trợ lý pháp lý AI">
        <Sparkles />
        <span>Hỏi trợ lý</span>
      </SheetTrigger>
      <SheetContent className="ai-sheet">
        <SheetHeader className="ai-header">
          <div className="ai-title-row">
            <span className="ai-avatar">
              <Bot />
            </span>
            <div>
              <SheetTitle>Trợ lý pháp lý ví điện tử</SheetTitle>
              <SheetDescription>
                Giải thích nhanh từ nguồn đã chọn lọc
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div className="ai-notice">
          Phục vụ học tập, không phải ý kiến tư vấn cho vụ việc cụ thể.
        </div>
        <div className="ai-messages" aria-live="polite">
          {!messages.length && (
            <div className="ai-welcome">
              <Sparkles />
              <h2>Bạn muốn làm rõ điều gì?</h2>
              <p>
                Trợ lý chỉ dùng dữ liệu đã chọn lọc về ví điện tử và 20 dịch vụ
                pháp lý trong báo cáo.
              </p>
              {[
                'Hợp đồng API ví điện tử cần điều khoản nào?',
                'Tại sao ví điện tử phải có tài khoản bảo đảm?',
                'Phân biệt dịch vụ tối thiểu và nâng cao của ví điện tử',
              ].map((s) => (
                <button key={s} onClick={() => setInput(s)}>
                  {s}
                  <CornerDownLeft />
                </button>
              ))}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`ai-message ${m.role}`}>
              {m.text || <LoaderCircle className="spin" />}
            </div>
          ))}
        </div>
        <form className="ai-form" onSubmit={submit}>
          {selectedText && (
            <div className="selected-context">
              <strong>Đoạn đang hỏi</strong>
              <span>
                {selectedText.slice(0, 260)}
                {selectedText.length > 260 ? '…' : ''}
              </span>
              <button type="button" onClick={() => setSelectedText('')}>
                Bỏ đoạn chọn
              </button>
            </div>
          )}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={1500}
            placeholder={
              usage >= 5
                ? 'Bạn đã dùng hết 5 lượt hôm nay'
                : 'Nhập câu hỏi về pháp luật ví điện tử…'
            }
            disabled={usage >= 5 || pending}
          />
          <div className="ai-form-row">
            <span>{usage}/5 lượt hôm nay</span>
            <button
              type="submit"
              disabled={!input.trim() || pending || usage >= 5}
              aria-label="Gửi câu hỏi"
            >
              {pending ? <LoaderCircle className="spin" /> : <Send />}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
