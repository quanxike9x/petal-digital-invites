import type { Invitation, Guest, Template } from '../types';
import { fixVietnamese } from '../utils/vietnameseUtils';

export interface DynamicBindingContext {
  groom: {
    name: string;
    parents: string;
  };
  bride: {
    name: string;
    parents: string;
  };
  story: string;
  event: {
    date: string;
    time: string;
    reception_time: string;
  };
  venue: {
    name: string;
    address: string;
    map_url: string;
  };
  gallery: string[];
  music: string;
  gift: {
    bank_name: string;
    account_number: string;
    account_name: string;
    groom_bank_name: string;
    groom_account_number: string;
    groom_account_name: string;
    bride_bank_name: string;
    bride_account_number: string;
    bride_account_name: string;
  };
  guest: {
    name: string;
    phone: string;
    custom_title?: string;
  };
}

export const createBindingContext = (
  invitation: Invitation,
  guest?: Guest | null
): DynamicBindingContext => {
  return {
    groom: {
      name: fixVietnamese(invitation.groom_name || 'Chú Rể'),
      parents: fixVietnamese(invitation.groom_parent || 'Gia Đình Nhà Trai'),
    },
    bride: {
      name: fixVietnamese(invitation.bride_name || 'Cô Dâu'),
      parents: fixVietnamese(invitation.bride_parent || 'Gia Đình Nhà Gái'),
    },
    story: fixVietnamese(invitation.story || ''),
    event: {
      date: invitation.wedding_date || '',
      time: invitation.ceremony_time || '',
      reception_time: invitation.reception_time || '',
    },
    venue: {
      name: fixVietnamese(invitation.venue_name || ''),
      address: fixVietnamese(invitation.address || ''),
      map_url: invitation.google_map || '',
    },
    gallery: invitation.gallery || [],
    music: invitation.music || '',
    gift: {
      bank_name: invitation.bank_name || '',
      account_number: invitation.account_number || '',
      account_name: fixVietnamese(invitation.account_name || ''),
      groom_bank_name: invitation.groom_bank_name || invitation.bank_name || '',
      groom_account_number: invitation.groom_account_number || invitation.account_number || '',
      groom_account_name: fixVietnamese(invitation.groom_account_name || invitation.account_name || ''),
      bride_bank_name: invitation.bride_bank_name || invitation.bank_name || '',
      bride_account_number: invitation.bride_account_number || invitation.account_number || '',
      bride_account_name: fixVietnamese(invitation.bride_account_name || invitation.account_name || ''),
    },
    guest: {
      name: guest ? fixVietnamese(guest.guest_name) : 'Quý Khách',
      phone: guest ? guest.guest_phone || '' : '',
      custom_title: guest ? guest.notes || '' : '',
    },
  };
};

/**
 * Interpolates mustache tokens {{path.to.key}} against binding context
 * e.g. "Trân trọng kính mời {{guest.name}} tới dự lễ cưới {{groom.name}} & {{bride.name}}"
 */
export const interpolateString = (templateStr: string, ctx: DynamicBindingContext): string => {
  if (!templateStr) return '';

  return templateStr.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, keyPath: string) => {
    const parts = keyPath.split('.');
    let curr: any = ctx;
    for (const part of parts) {
      if (curr && typeof curr === 'object' && part in curr) {
        curr = curr[part];
      } else {
        return '';
      }
    }
    return typeof curr === 'string' || typeof curr === 'number' ? String(curr) : '';
  });
};

/**
 * Checks if a component should be hidden based on data availability
 */
export const shouldHideComponent = (componentType: string, binding?: string, ctx?: DynamicBindingContext): boolean => {
  if (!ctx) return false;

  if (binding === 'story' || componentType === 'story') {
    return !ctx.story || ctx.story.trim() === '';
  }

  if (binding === 'gallery' || componentType === 'gallery') {
    return !ctx.gallery || ctx.gallery.length === 0;
  }

  if (binding === 'music' || componentType === 'music') {
    return !ctx.music || ctx.music.trim() === '';
  }

  if (binding === 'google_map' || componentType === 'maps') {
    return !ctx.venue.map_url && !ctx.venue.address;
  }

  if (binding === 'payment_qr' || componentType === 'vietqr') {
    return !ctx.gift.account_number;
  }

  return false;
};

/**
 * Dynamically injects SEO & OpenGraph tags for Invitation Public Runtime
 */
export const updateSEOMetadata = (invitation: Invitation, guest?: Guest | null) => {
  const coupleTitle = `${fixVietnamese(invitation.groom_name)} & ${fixVietnamese(invitation.bride_name)}`;
  const guestGreeting = guest ? ` [Thư Mời Dành Cho ${fixVietnamese(guest.guest_name)}]` : '';
  const pageTitle = `Thiệp Cưới Online: ${coupleTitle}${guestGreeting} - Pudwedding.shop`;
  const metaDescription = `Trân trọng kính mời ${guest ? fixVietnamese(guest.guest_name) : 'Quý Khách'} tới tham dự Lễ Thành Hôn của ${coupleTitle} vào ngày ${invitation.wedding_date} tại ${invitation.venue_name || 'Trung tâm tiệc cưới'}.`;

  document.title = pageTitle;

  // Meta Description
  let metaDescTag = document.querySelector('meta[name="description"]');
  if (!metaDescTag) {
    metaDescTag = document.createElement('meta');
    metaDescTag.setAttribute('name', 'description');
    document.head.appendChild(metaDescTag);
  }
  metaDescTag.setAttribute('content', metaDescription);

  // OG Title
  let ogTitleTag = document.querySelector('meta[property="og:title"]');
  if (!ogTitleTag) {
    ogTitleTag = document.createElement('meta');
    ogTitleTag.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitleTag);
  }
  ogTitleTag.setAttribute('content', pageTitle);

  // OG Image
  let ogImageTag = document.querySelector('meta[property="og:image"]');
  if (!ogImageTag) {
    ogImageTag = document.createElement('meta');
    ogImageTag.setAttribute('property', 'og:image');
    document.head.appendChild(ogImageTag);
  }
  ogImageTag.setAttribute('content', invitation.thumbnail_url || 'https://images.unsplash.com/photo-1519741497674-611481863552');

  // JSON-LD Structured Data
  let jsonLdScript = document.getElementById('wedding-jsonld');
  if (!jsonLdScript) {
    jsonLdScript = document.createElement('script');
    jsonLdScript.id = 'wedding-jsonld';
    jsonLdScript.setAttribute('type', 'application/ld+json');
    document.head.appendChild(jsonLdScript);
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `Lễ Thành Hôn: ${coupleTitle}`,
    startDate: invitation.wedding_date,
    location: {
      '@type': 'Place',
      name: invitation.venue_name || 'Địa Điểm Tổ Chức',
      address: invitation.address || '',
    },
    image: [invitation.thumbnail_url],
    description: metaDescription,
  };

  jsonLdScript.textContent = JSON.stringify(structuredData);
};
