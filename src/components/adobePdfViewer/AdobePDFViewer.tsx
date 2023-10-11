import React from "react";

function AdobePDFViewer() {
  return <div>AdobePDFViewer</div>;
}

export default AdobePDFViewer;
// import React, { useEffect, useRef } from "react";
// import ReactViewAdobe from "react-adobe-embed";

// interface AdobePDFViewerProps {
//   pdfUrl: string;
// }

// const AdobePDFViewer: React.FC<AdobePDFViewerProps> = ({ pdfUrl }) => {
//   const viewerRef = useRef<HTMLDivElement>(null);

//   return (
//     <>
//       <ReactViewAdobe
//         clientId={"324caa2a91b84f688935436cd2d2521"}
//         useReactHookForAdobeAPIConfigs="useMemo"
//         useReactHookWhenLoadingAdobeAPI="useMemo"
//         triggerAdobeDCViewRender={true}
//         url={pdfUrl}
//         id="exhbit-e-pdf"
//         fileMeta={{
//           fileName: "pdf document",
//         }}
//         previewConfig={{
//           defaultViewMode: "FIT_WIDTH",
//           showAnnotationTools: false,
//           showPageControls: false,
//           showDownloadPDF: false,
//         }}
//       />
//     </>
//   );
// };

// export default AdobePDFViewer;

//clientId: "9ae7b1361f3e404985e32bdb52dcbc04",
