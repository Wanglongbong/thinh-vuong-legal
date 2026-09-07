import { notFound } from 'next/navigation';
import { LegalPlatform } from '@/components/legal-platform';

const tools = [
  'hoi-dap',
  'tao-hop-dong',
  'review',
  'so-sanh',
  'ho-so',
  'tep',
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool?: string[] }>;
}) {
  const { tool } = await params;
  const label = tool?.[0] || 'Trung tâm công cụ';
  return { title: `${label.replaceAll('-', ' ')} · Thịnh Vượng Legal` };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ tool?: string[] }>;
}) {
  const { tool } = await params;
  if (!tool?.length) return <LegalPlatform tool="tong-quan" />;
  if (tool.length !== 1 || !tools.includes(tool[0] as (typeof tools)[number]))
    notFound();
  return <LegalPlatform tool={tool[0] as (typeof tools)[number]} />;
}
