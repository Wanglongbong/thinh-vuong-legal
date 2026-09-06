'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowUpRight, Search, SlidersHorizontal } from 'lucide-react';
import { contracts, services } from '@/lib/site-data';

type Tier = 'all' | 'minimum' | 'advanced';

export function ContractExplorer() {
  const [query, setQuery] = useState(''); const [tier, setTier] = useState<Tier>('all'); const [group, setGroup] = useState('all');
  const results = useMemo(() => { const normalized = query.trim().toLocaleLowerCase('vi'); return contracts.filter((item) => (!normalized || `${item.title} ${item.summary} ${item.audience}`.toLocaleLowerCase('vi').includes(normalized)) && (tier === 'all' || (tier === 'minimum' ? item.minimum : !item.minimum)) && (group === 'all' || item.group === group)); }, [query, tier, group]);
  return <div className="contract-explorer"><div className="contract-controls"><label className="search-box"><Search aria-hidden="true" /><span className="sr-only">Tìm hợp đồng</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên, đối tượng hoặc vấn đề…" /></label><div className="filter-row" aria-label="Lọc theo mức dịch vụ"><SlidersHorizontal aria-hidden="true" />{([['all', 'Tất cả'], ['minimum', 'Tối thiểu (*)'], ['advanced', 'Nâng cao']] as const).map(([value, label]) => <button key={value} onClick={() => setTier(value)} className={tier === value ? 'active' : ''}>{label}</button>)}</div><label className="select-box"><span className="sr-only">Lọc theo nhóm dịch vụ</span><select value={group} onChange={(e) => setGroup(e.target.value)}><option value="all">Mọi nhóm dịch vụ</option>{services.map((s) => <option key={s.id} value={s.id}>{s.number}. {s.title}</option>)}</select></label></div>
    <div className="result-summary"><strong>{results.length}</strong> tài liệu phù hợp <span>· Cập nhật 09/2026</span></div>
    {results.length ? <div className="contract-grid">{results.map((item) => { const service = services.find((s) => s.id === item.group); return <Link className="contract-card" href={`/hop-dong/${item.slug}`} key={item.slug}><div className="contract-card-top"><span className={item.minimum ? 'tier minimum' : 'tier advanced'}>{item.minimum ? 'Tối thiểu (*)' : 'Nâng cao'}</span><ArrowUpRight /></div><span className="contract-group">{service?.number}. {service?.title}</span><h2>{item.shortTitle}</h2><p>{item.summary}</p><span className="contract-owner">Phụ trách: {item.owner}</span></Link>; })}</div> : <div className="empty-state"><Search /><h2>Chưa tìm thấy tài liệu phù hợp</h2><p>Thử bỏ bớt từ khóa hoặc chọn lại nhóm dịch vụ.</p></div>}
  </div>;
}
