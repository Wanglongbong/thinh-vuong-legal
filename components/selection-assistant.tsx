'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export function SelectionAssistant() {
  const [selection, setSelection] = useState('');
  useEffect(() => { const update = () => { const text = window.getSelection()?.toString().trim() ?? ''; setSelection(text.length >= 20 && text.length <= 3000 ? text : ''); }; document.addEventListener('selectionchange', update); return () => document.removeEventListener('selectionchange', update); }, []);
  if (!selection) return null;
  return <button className="selection-ask" onMouseDown={(e) => e.preventDefault()} onClick={() => { window.dispatchEvent(new CustomEvent('tv:ask-selection', { detail: selection })); setSelection(''); }}><Sparkles /> Hỏi trợ lý về đoạn đã chọn</button>;
}
