import React, { useEffect, useRef } from "react";

interface AdobePDFViewerProps {
  pdfUrl: string;
}

const AdobePDFViewer: React.FC<AdobePDFViewerProps> = ({ pdfUrl }) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewerRef.current) {
      // Load the Adobe Embed API script
      //   const script = document.createElement("script");
      //   script.src = "https://documentcloud.adobe.com/view-sdk/viewer.js";
      //   script.async = true;
      //   document.body.appendChild(script);

      //   // Initialize the PDF viewer
      //   script.onload = () => {
      if (window.AdobeDC) {
        const adobeDCView = new window.AdobeDC.View({
          clientId: "9ae7b1361f3e404985e32bdb52dcbc04",
          divId: viewerRef.current!.id,
        });
        adobeDCView.previewFile(
          {
            content: {
              location: {
                url: "https://acrobatservices.adobe.com/view-sdk-demo/PDFs/Bodea Brochure.pdf",
              },
            },
            metaData: { fileName: "Bodea Brochure.pdf" },
          },
          { embedMode: "IN_LINE" }
        );
      }
      //   };
    }
  }, [pdfUrl]);

  return <div id="adobe-dc-view" ref={viewerRef}></div>;
};

export default AdobePDFViewer;
