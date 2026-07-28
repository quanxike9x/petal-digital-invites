import React from 'react';
import type { UnifiedComponentInstance } from '../registry/ComponentRegistry';
import { TextComponent } from '../components/editor/components/TextComponent';
import { ImageComponent } from '../components/editor/components/ImageComponent';
import { GalleryComponent } from '../components/editor/components/GalleryComponent';
import { CountdownComponent } from '../components/editor/components/CountdownComponent';
import { TimelineComponent } from '../components/editor/components/TimelineComponent';
import { CalendarComponent } from '../components/editor/components/CalendarComponent';
import { MapComponent } from '../components/editor/components/MapComponent';
import { MusicComponent } from '../components/editor/components/MusicComponent';
import { QRGiftComponent } from '../components/editor/components/QRGiftComponent';
import { RSVPComponent } from '../components/editor/components/RSVPComponent';
import { VideoComponent } from '../components/editor/components/VideoComponent';
import { DividerComponent } from '../components/editor/components/DividerComponent';
import { SpacerComponent } from '../components/editor/components/SpacerComponent';

interface ComponentRendererProps {
  component: UnifiedComponentInstance;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({ component }) => {
  const renderComponent = () => {
    switch (component.type) {
      case 'Text':
        return <TextComponent props={component.props} style={component.style} />;
      case 'Image':
        return <ImageComponent props={component.props} style={component.style} />;
      case 'Gallery':
        return <GalleryComponent props={component.props} style={component.style} />;
      case 'Countdown':
        return <CountdownComponent component={component} />;
      case 'Timeline':
        return <TimelineComponent props={component.props} style={component.style} />;
      case 'Map':
        return <MapComponent component={component} />;
      case 'Music':
        return <MusicComponent props={component.props} style={component.style} />;
      case 'QR':
        return <QRGiftComponent props={component.props} style={component.style} />;
      case 'RSVP':
        return <RSVPComponent component={component} />;
      case 'Video':
        return <VideoComponent props={component.props} style={component.style} />;
      case 'Divider':
        return <DividerComponent props={component.props} style={component.style} />;
      case 'Spacer':
        return <SpacerComponent props={component.props} style={component.style} />;
      default:
        return <CalendarComponent component={component} />;
    }
  };

  return (
    <div className="w-full h-full">
      {renderComponent()}
    </div>
  );
};