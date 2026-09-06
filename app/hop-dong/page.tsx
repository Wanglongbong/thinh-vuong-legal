import { ContractExplorer } from '@/components/contract-explorer';
import { SectionHero } from '@/components/section-hero';

export const metadata = { title: 'Thư viện hợp đồng ví điện tử' };
export default function ContractsPage() { return <main><SectionHero eyebrow="Thư viện pháp lý" title="Hợp đồng đúng với từng mắt xích của ví điện tử" description="Tra cứu theo mức độ cần thiết hoặc giai đoạn hoạt động. Mỗi trang là bản giới thiệu phạm vi, không phải mẫu dùng để ký ngay."><div className="hero-stat"><strong>20</strong><span>hợp đồng, chính sách và bộ hồ sơ</span></div></SectionHero><section className="content-section"><div className="site-shell"><ContractExplorer /></div></section></main>; }
