import React, { useEffect } from 'react';

export interface CustomHtmlWidgetProps {
  id: string;
  headCode?: string;
  bodyCode?: string;
  customCss?: string;
  customJs?: string;
  rawHtml?: string;
}

export const CustomHtmlWidget: React.FC<CustomHtmlWidgetProps> = ({
  id,
  headCode = '',
  bodyCode = '',
  customCss = '',
  customJs = '',
  rawHtml = '',
}) => {
  // Execute Custom JS safely on mount
  useEffect(() => {
    if (customJs && customJs.trim()) {
      try {
        const fn = new Function(customJs);
        fn();
      } catch (err) {
        console.warn(`[CustomHtmlWidget ${id}] Custom JS execution error:`, err);
      }
    }
  }, [id, customJs]);

  return (
    <div id={id} className="custom-html-widget my-4">
      {/* Inject Custom CSS Style tag for current template */}
      {customCss && (
        <style dangerouslySetInnerHTML={{ __html: customCss }} />
      )}

      {/* Render Raw HTML snippet if present */}
      {rawHtml && (
        <div dangerouslySetInnerHTML={{ __html: rawHtml }} />
      )}
    </div>
  );
};
