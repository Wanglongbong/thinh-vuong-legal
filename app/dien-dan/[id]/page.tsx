import { ForumThread } from '@/components/forum';
export const metadata = {
  title: 'Trao đổi pháp luật',
  robots: { index: false, follow: true },
};
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ForumThread id={id} />;
}
