import type { Invitation, Guest } from '../types';

export const seoService = {
  /**
   * Inject dynamic OpenGraph, Twitter Cards, Canonical Meta Tags
   */
  injectSEOTags: (invitation: Invitation, guest?: Guest | null): void => {
    const title = guest 
      ? `Thiệp Cưới: ${invitation.title} • Trân Trọng Kính Mời ${guest.guest_name}`
      : `Thiệp Cưới Online: ${invitation.bride_name || 'Cô Dâu'} & ${invitation.groom_name || 'Chú Rể'}`;

    const description = `Trân trọng kính mời bạn đến tham dự Lễ Thành Hôn & Tiệc Mừng Cưới của ${invitation.bride_name || 'Cô Dâu'} & ${invitation.groom_name || 'Chú Rể'}. Ngày ${invitation.wedding_date || 'tại Trung tâm Tiệc Cưới'}.`;

    const imageUrl = invitation.thumbnail_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200';
    const currentUrl = window.location.href;

    // Update document title
    document.title = title;

    // Helper: Set Meta Tag
    const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard SEO
    setMetaTag('meta[name="description"]', 'name', 'description', description);

    // OpenGraph
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', imageUrl);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');

    // Twitter Cards
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);

    // Canonical Tag
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // Inject JSON-LD Schema.org
    seoService.injectJSONLD(invitation);
  },

  /**
   * Inject Schema.org/WeddingEvent JSON-LD Structured Data
   */
  injectJSONLD: (invitation: Invitation): void => {
    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      'name': `Lễ Thành Hôn ${invitation.bride_name} & ${invitation.groom_name}`,
      'startDate': invitation.wedding_date || new Date().toISOString(),
      'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
      'eventStatus': 'https://schema.org/EventScheduled',
      'location': {
        '@type': 'Place',
        'name': invitation.venue_name || 'Trung tâm tiệc cưới',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': invitation.address || 'Việt Nam',
        },
      },
      'image': [invitation.thumbnail_url || 'https://images.unsplash.com/photo-1519741497674-611481863552'],
      'description': `Thiệp cưới online chính thức của ${invitation.bride_name} & ${invitation.groom_name}`,
      'organizer': {
        '@type': 'Person',
        'name': `${invitation.bride_name} & ${invitation.groom_name}`,
      },
    };

    script.textContent = JSON.stringify(schemaData);
  },

  /**
   * Generate Sitemap XML string
   */
  generateSitemapXML: (invitations: Invitation[]): string => {
    const domain = 'https://pudwedding.shop';
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    xml += `  <url>\n    <loc>${domain}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    invitations.forEach((inv) => {
      xml += `  <url>\n    <loc>${domain}/w/${inv.slug}</loc>\n    <lastmod>${new Date(inv.updated_at).toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
  },

  /**
   * Generate robots.txt string
   */
  generateRobotsTXT: (): string => {
    return `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /editor/\nDisallow: /dashboard/\nSitemap: https://pudwedding.shop/sitemap.xml\n`;
  },
};
