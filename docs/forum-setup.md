# Bật diễn đàn dùng chung

Mã diễn đàn đã có trong dự án. Khi chưa cấu hình Supabase, trang hiện thông báo và không cho đăng bài. Không có dữ liệu giả hoặc cơ chế lưu bài riêng trên máy rồi báo thành công.

## Thiết lập trên gói miễn phí

1. Tạo dự án Supabase thuộc tài khoản của chủ website. Không nâng cấp gói trả phí để thực hiện các bước này.
2. Trong SQL Editor, chạy toàn bộ `supabase/migrations/202609080001_forum.sql` một lần.
3. Trong Authentication → Providers, bật Anonymous Sign-Ins. Khách vẫn không phải nhập tài khoản. Supabase tạo định danh ẩn danh để xác định quyền sửa/gỡ bài; đây không phải ẩn danh tuyệt đối với nhà cung cấp hạ tầng.
4. Trong Vercel → Settings → Environment Variables, thêm các biến theo `.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `FORUM_RATE_LIMIT_SALT` (chuỗi ngẫu nhiên dài tối thiểu 32 ký tự, giữ ổn định). Chỉ hai biến đầu là thông tin công khai. Không đưa khóa service-role hoặc salt vào GitHub, mã phía trình duyệt hay hội thoại.
5. Tạo người dùng quản trị chính thức trong Supabase Auth bằng email của chủ website; chủ tài khoản tự đặt mật khẩu. Sao chép UUID người dùng vào `FORUM_ADMIN_USER_ID` trên Vercel. Không chỉ dựa vào email hoặc thông tin do trình duyệt tự khai để cấp quyền.
6. Triển khai lại Vercel. Mở `/dien-dan/quan-tri` để đăng nhập quản trị.

## Kiểm chứng trước khi mở đăng bài

- `node scripts/test-forum.mjs`: kiểm tra lược đồ dữ liệu và quyền bằng PostgreSQL biệt lập trong bộ nhớ, không đụng dữ liệu thật.
- Mở hai trình duyệt/phiên khác nhau. Phiên A đăng bài; phiên B phải đọc và bình luận được nhưng không được sửa bài A.
- Kiểm tra giới hạn 3 bài và 15 bình luận/giờ theo cả người dùng và IP. Người cùng mạng dùng chung hạn mức IP.
- Kiểm tra sửa/gỡ nội dung của mình, báo cáo vi phạm, quản trị ẩn/khôi phục và khóa/mở bình luận. Bài tác giả đã gỡ không tự khôi phục qua nút kiểm duyệt.
- Kiểm tra lỗi mất kết nối: không hiển thị thông báo đã đăng thành công, giữ nội dung trong ô nhập để người dùng sao chép.
- Hiện chưa tích hợp CAPTCHA. Nếu có hành vi lạm dụng danh tính ẩn danh, bật thêm CAPTCHA của Supabase và bổ sung luồng nhận token ở form trước khi tăng lưu lượng truy cập.

## Bảo vệ dữ liệu và vận hành

- Các bảng bật RLS và không cho vai trò trình duyệt đọc/ghi trực tiếp. Mọi thao tác qua máy chủ và quyền sở hữu được kiểm tra tại cơ sở dữ liệu. Hàm ghi chỉ cấp quyền cho service-role.
- Nội dung người dùng hiển thị dưới dạng văn bản, không thực thi HTML. Không có tệp đính kèm.
- API công khai không trả UUID tác giả, thông tin phiên hoặc dấu vết IP. IP được băm HMAC tại máy chủ; chỉ lưu dấu băm để chống spam, tự dọn sự kiện quá 24 giờ khi có lần ghi mới.
- Dùng `x-vercel-forwarded-for` do Vercel cung cấp. Nếu chuyển hạ tầng, phải thay cách xác định IP đáng tin cậy trước khi mở diễn đàn.
- Gỡ bài là ẩn mềm, chưa xóa bản ghi trong cơ sở dữ liệu; chủ hệ thống cần quy trình tiếp nhận yêu cầu xóa dữ liệu. Không đưa dữ liệu cá nhân nhạy cảm lên diễn đàn.
- Phiên ẩn danh lưu bằng cookie HttpOnly. Xóa cookie/đổi trình duyệt sẽ mất quyền sở hữu trên phiên cũ; không hứa khôi phục khi chưa có xác minh.
- Theo dõi báo cáo vi phạm hằng ngày vì bài xuất hiện ngay. Bản triển khai này không gửi email thông báo.

## Tài liệu chính thức

- [Supabase Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Supabase server-side authentication](https://supabase.com/docs/guides/auth/server-side)

## Hoàn tác an toàn

Nếu lỗi nghiêm trọng: bỏ các biến Supabase khỏi deployment mới để tạm khóa diễn đàn, hoặc dùng Vercel Instant Rollback về deployment ổn định. Không xóa bảng dữ liệu để hoàn tác giao diện. Báo cáo Word và các chức năng cũ không phụ thuộc diễn đàn.
