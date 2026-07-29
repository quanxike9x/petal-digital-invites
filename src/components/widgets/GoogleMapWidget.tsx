import React from 'react';
import { MapPin, AlertCircle } from 'lucide-react';

export interface GoogleMapWidgetProps {
  id: string;
  content?: string;
  url?: string;
  settings?: {
    lat?: number | string;
    lng?: number | string;
    zoom?: number;
  };
}

export const GoogleMapWidget: React.FC<GoogleMapWidgetProps> = ({
  id,
  content,
  url,
  settings = {},
}) => {
  const rawUrl = (content || url || '').trim();
  const zoom = settings.zoom || 15;

  let isUnparseable = false;

  const getMapEmbedSrc = (): string => {
    if (rawUrl.includes('google.com/maps/embed')) {
      return rawUrl;
    }
    if (rawUrl.includes('@')) {
      const match = rawUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        return `https://maps.google.com/maps?q=${match[1]},${match[2]}&z=${zoom}&output=embed`;
      }
    }
    if (settings.lat && settings.lng) {
      return `https://maps.google.com/maps?q=${settings.lat},${settings.lng}&z=${zoom}&output=embed`;
    }
    if (rawUrl.includes('maps.app.goo.gl') || rawUrl.includes('goo.gl/maps')) {
      // Direct short links can't always be parsed client-side without API; fallback query or lat/lng
      const searchMatch = rawUrl.match(/place\/([^/]+)/);
      if (searchMatch) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(searchMatch[1]))}&z=${zoom}&output=embed`;
      }
    }
    if (rawUrl && !rawUrl.startsWith('http')) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(rawUrl)}&z=${zoom}&output=embed`;
    }

    return `https://maps.google.com/maps?q=10.7769,106.7009&z=${zoom}&output=embed`;
  };

  return (
    <div id={id} className="google-map-widget w-full h-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 relative bg-slate-100 flex flex-col">
      <iframe
        src={getMapEmbedSrc()}
        title="Google Maps"
        className="w-full h-full border-0"
        loading="lazy"
      />
    </div>
  );
};
