import type { ReactNode } from 'react';

export function SectionHero({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <section className="section-hero"><div className="site-shell section-hero-inner"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{children && <div className="section-hero-aside">{children}</div>}</div></section>;
}
