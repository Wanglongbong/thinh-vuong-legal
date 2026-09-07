'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type DemoFile = {
  id: string;
  name: string;
  format: 'pdf' | 'docx';
  size: number;
  text: string;
  addedAt: string;
};

type DemoSessionValue = {
  files: DemoFile[];
  addFile: (file: DemoFile) => void;
  removeFile: (id: string) => void;
  clearSession: () => void;
};

const DemoSessionContext = createContext<DemoSessionValue | null>(null);

export function DemoSessionProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<DemoFile[]>([]);
  const value = useMemo<DemoSessionValue>(
    () => ({
      files,
      addFile: (file) =>
        setFiles((current) => [
          file,
          ...current.filter((x) => x.id !== file.id),
        ]),
      removeFile: (id) =>
        setFiles((current) => current.filter((file) => file.id !== id)),
      clearSession: () => setFiles([]),
    }),
    [files],
  );

  return (
    <DemoSessionContext.Provider value={value}>
      {children}
    </DemoSessionContext.Provider>
  );
}

export function useDemoSession() {
  const value = useContext(DemoSessionContext);
  if (!value)
    throw new Error('useDemoSession phải được dùng trong DemoSessionProvider');
  return value;
}
