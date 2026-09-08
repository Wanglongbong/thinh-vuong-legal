export const forumCategories = [
  'Ví điện tử và Fintech',
  'Hợp đồng',
  'Doanh nghiệp và đầu tư',
  'Lao động',
  'Pháp luật khác',
] as const;
export type ForumPost = {
  id: string;
  title: string;
  body: string;
  category: string;
  nickname: string;
  created_at: string;
  updated_at: string;
  status: string;
  locked: boolean;
  mine: boolean;
};
export type ForumComment = {
  id: string;
  post_id: string;
  body: string;
  nickname: string;
  created_at: string;
  status: string;
  mine: boolean;
};
export type ForumFlag = {
  id: string;
  post_id: string | null;
  comment_id: string | null;
  reason: string;
  resolved: boolean;
  created_at: string;
};
export const forumUnavailable =
  'Diễn đàn đang chờ kết nối cơ sở dữ liệu. Tính năng đăng bài và bình luận chưa được mở; nội dung bạn nhập sẽ không được gửi hoặc lưu giả lập.';
