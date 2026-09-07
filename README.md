# Thịnh Vượng Legal

Website mô phỏng dịch vụ pháp lý chuyên về ví điện tử và trung gian thanh toán. Khu vực `/cong-cu` cung cấp hỏi đáp pháp luật, tạo hợp đồng, review, so sánh, bộ hồ sơ sáu chương và quản lý tệp tạm thời.

## Quy tắc dữ liệu demo

- Không yêu cầu đăng nhập và không có cơ sở dữ liệu hồ sơ người dùng.
- Chỉ tên gọi của khách hàng được lưu trong trình duyệt để dùng lại ở lần sau.
- PDF/DOCX được trích xuất trong trình duyệt, tối đa 20 MB và 50.000 ký tự.
- Chỉ gửi nội dung tới API sau khi người dùng xác nhận; yêu cầu OpenAI đặt `store: false`.
- Khi thiếu `OPENAI_API_KEY`, công cụ hiển thị rõ chế độ dữ liệu mẫu.
- Văn bản xuất ra phục vụ học tập và phải được luật sư rà soát trước khi áp dụng.

Website công khai: https://thinh-vuong-legal.vercel.app

Website mô phỏng dịch vụ pháp lý hỗ trợ thành lập và vận hành doanh nghiệp cung ứng ví điện tử tại Việt Nam, xây dựng cho môn Thực hành nghề luật.

## Chạy tại máy

1. Chạy `npm install`.
2. Sao chép `.env.example` thành `.env.local`; chỉ thêm khóa ở máy hoặc nền tảng triển khai.
3. Chạy `npm run dev`.

Không có `OPENAI_API_KEY`, mọi trang và tính năng tra cứu vẫn hoạt động; riêng trợ lý AI sẽ báo chưa được kích hoạt.

## Nguyên tắc

- Không đưa khóa API hoặc dữ liệu khách hàng vào Git.
- Không coi nội dung là ý kiến tư vấn cho vụ việc cụ thể.
- Kiểm tra hiệu lực văn bản trước khi áp dụng.
