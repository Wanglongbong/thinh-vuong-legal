import { NewForumPost } from '@/components/forum';
export const metadata = {
  title: 'Viết bài trao đổi',
  robots: { index: false, follow: false },
};
export default function Page() {
  return <NewForumPost />;
}
