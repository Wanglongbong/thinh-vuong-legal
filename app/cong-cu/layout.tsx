import { PlatformShell } from '@/components/platform-shell';

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlatformShell>{children}</PlatformShell>;
}
