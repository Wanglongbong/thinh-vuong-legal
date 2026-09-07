import { SectionHero } from '@/components/section-hero';

export const metadata = { title: 'Tuyên bố pháp lý' };
export default function DisclaimerPage() {
  return (
    <main>
      <SectionHero
        eyebrow="Minh bạch thông tin"
        title="Tuyên bố pháp lý và quyền riêng tư"
        description="Giới hạn sử dụng nội dung của website mô phỏng Thịnh Vượng Legal."
      />
      <section className="content-section">
        <article className="site-shell prose-card">
          <section>
            <h2>1. Mục đích học tập</h2>
            <p>
              Website được xây dựng cho môn Thực hành nghề luật trên cơ sở tình
              huống giả định. Công ty TNHH Thịnh Vượng trong website là chủ thể
              mô phỏng cung cấp dịch vụ pháp lý cho dự án thành lập doanh nghiệp
              ví điện tử.
            </p>
          </section>
          <section>
            <h2>2. Không phải ý kiến tư vấn</h2>
            <p>
              Nội dung chỉ có giá trị tham khảo học thuật, không tạo quan hệ
              luật sư – khách hàng và không thể thay cho ý kiến của tổ chức hành
              nghề luật sư hoặc chuyên gia đủ điều kiện đối với vụ việc thực tế.
            </p>
          </section>
          <section>
            <h2>3. Không bảo đảm cấp phép</h2>
            <p>
              Việc thành lập doanh nghiệp không đồng nghĩa với quyền cung ứng ví
              điện tử. Quyết định cấp giấy phép thuộc cơ quan nhà nước có thẩm
              quyền; tư vấn pháp lý không thay thế thẩm định kỹ thuật, kiểm toán
              hoặc chứng nhận an toàn hệ thống.
            </p>
          </section>
          <section>
            <h2>4. Dữ liệu và trợ lý AI</h2>
            <p>
              Website không có biểu mẫu lưu thông tin liên hệ. Người dùng không
              nên nhập bí mật kinh doanh, khóa API, dữ liệu định danh, dữ liệu
              tài chính hoặc thông tin cá nhân của người khác vào trợ lý. Câu
              hỏi có thể được gửi đến dịch vụ mô hình AI để tạo câu trả lời; khi
              dịch vụ này không khả dụng, hệ thống sử dụng dữ liệu nội bộ.
              Website không lưu câu hỏi thành hồ sơ tư vấn.
            </p>
          </section>
          <section>
            <h2>5. Hiệu lực văn bản</h2>
            <p>
              Danh mục pháp luật được rà soát cho mục đích học tập đến tháng
              09/2026. Người sử dụng phải kiểm tra toàn văn, lịch sử sửa đổi và
              hiệu lực tại thời điểm áp dụng.
            </p>
          </section>
        </article>
      </section>
    </main>
  );
}
