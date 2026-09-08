import { ForumIndex } from '@/components/forum';
export const metadata = {
  title: 'Quản trị diễn đàn',
  robots: { index: false, follow: false },
};
export default function Page() {
  return <ForumIndex moderation />;
}
