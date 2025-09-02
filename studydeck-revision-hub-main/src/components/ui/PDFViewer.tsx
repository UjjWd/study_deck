import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

interface PDFViewerProps {
  fileUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl }) => {
  return (
    <Worker workerUrl="//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
      <Viewer
        fileUrl={fileUrl}
        defaultScale={1.0}
        theme="light"
        onError={(error) => {
          console.error('PDF viewer error:', error);
        }}
      />
    </Worker>
  );
};

export default PDFViewer;
