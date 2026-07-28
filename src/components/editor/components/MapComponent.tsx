import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import type { UnifiedComponentInstance } from '../../../registry/ComponentRegistry';

interface MapComponentProps {
  component: UnifiedComponentInstance;
}

export const MapComponent: React.FC<MapComponentProps> = ({ component }) => {
  const props = component.props || {};
  const style = component.style || {};

  const address = (props.address as string) || 'Trung tâm Tiệc cưới Pudwedding, Hà Nội';
  const latitude = props.latitude ? String(props.latitude) : '';
  const longitude = props.longitude ? String(props.longitude) : '';

  const hasCoords = Boolean(latitude && longitude);
  const mapQuery = hasCoords ? `${latitude},${longitude}` : encodeURIComponent(address);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const googleMapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div 
      className="w-full h-full flex flex-col rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md font-sans select-none"
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div className="p-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-semibold text-xs truncate">{address}</span>
        </div>

        <a
          href={googleMapsExternalUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:underline bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 shrink-0"
        >
          <span>Xem Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="w-full flex-1 relative bg-slate-100" style={{ flex: 1, minHeight: 0 }}>
        <iframe
          title="Map Location"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={mapEmbedUrl}
          className="w-full h-full border-0"
          style={{ width: '100%', height: '100%', border: 0 }}
        />
      </div>
    </div>
  );
};