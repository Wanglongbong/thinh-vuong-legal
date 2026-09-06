import { SectionHero } from '@/components/section-hero';
import { team } from '@/lib/site-data';

export const metadata = { title: 'Đội ngũ dự án' };
export default function TeamPage() { return <main><SectionHero eyebrow="Nhóm 13" title="Đội ngũ xây dựng nội dung" description="Mười hai thành viên cùng phát triển hệ thống dịch vụ pháp lý mô phỏng cho dự án ví điện tử. Chức danh phản ánh phần việc học tập, không phải tư cách luật sư."><div className="hero-stat"><strong>12</strong><span>thành viên · một hệ thống nội dung</span></div></SectionHero><section className="content-section"><div className="site-shell team-grid">{team.map(([name, id, role], index) => <article className="team-card" key={id}><div className="team-initials">{name.split(' ').slice(-2).map((part) => part[0]).join('')}</div><span className="team-index">{String(index + 1).padStart(2, '0')}</span><h2>{name}</h2><p>{role}</p><small>MSV {id}</small></article>)}</div></section></main>; }
