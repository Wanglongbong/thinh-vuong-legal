import type { MetadataRoute } from 'next';
import { contracts } from '@/lib/site-data';
export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://thinh-vuong-legal.vercel.app';
  const routes = [
    '',
    '/dich-vu',
    '/hop-dong',
    '/bao-cao-so-bo',
    '/bao-cao-so-bo/day-du',
    '/bao-cao-so-bo/rut-gon',
    '/dien-dan',
    '/tao-hop-dong',
    '/doi-ngu',
    '/kien-thuc',
    '/lien-he',
    '/tuyen-bo-phap-ly',
  ];
  return [
    ...routes.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.7,
    })),
    ...contracts.map((item) => ({
      url: `${base}/hop-dong/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
