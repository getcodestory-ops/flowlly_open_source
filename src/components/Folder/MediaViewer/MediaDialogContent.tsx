import { useState } from "react";
import { StorageResourceEntity } from "@/types/document";
import { FileText, ExternalLink, Download } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import ContentEditor from "@/components/DocumentEditor/ContentEditor";
import { useStorageTextFileSave } from "@/components/DocumentEditor/useStorageTextSave";
import { Table } from "@/components/ui/table";

// Update the import for react-pdf
// import { Document, Page, pdfjs } from "react-pdf";
// import "react-pdf/dist/esm/Page/AnnotationLayer.css";
// import "react-pdf/dist/esm/Page/TextLayer.css";

// // Set up the worker
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface MediaDialogContentProps {
  resource: StorageResourceEntity;
}

export const MediaDialogContent: React.FC<MediaDialogContentProps> = ({
  resource,
}) => {
  const { file_name, metadata, url } = resource || {};
  const description = metadata?.description;
  const fileExt = metadata?.extension?.toLowerCase();

  const { onSubmit, isPending } = useStorageTextFileSave(resource?.id);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  switch (fileExt) {
    case ".jpg":
    case ".jpeg":
    case ".png":
    case ".gif":
      return (
        <>
          <img
            src={url}
            alt={file_name}
            className="align-middle object-cover max-h-80"
          />
          <DescriptionContent description={description} />
        </>
      );
    case ".mp4":
    case ".webm":
      return (
        <>
          {/* <AspectRatio ratio={1}> */}
          <div className="max-h-96  overflow-auto">
            <video controls>
              <source src={url} type="video/mp4" />
              Your browser does not support the video tag
            </video>
          </div>
          {/* </AspectRatio> */}
          <DescriptionContent description={description} />
        </>
      );
    case ".mp3":
    case ".ogg":
    case ".wav":
      return (
        <>
          <div className="flex flex-col items-center justify-center  p-4">
            <div className="w-full min-w-[300px]">
              <audio src={url} controls style={{ width: "100%" }}>
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
          <DescriptionContent description={description} />
        </>
      );
    case ".txt":
      return (
        <ContentEditor content={metadata?.content} saveFunction={onSubmit} />
      );
    case ".pdf":
      return (
        <>
          <div className="flex flex-col items-center justify-center p-4">
            <FileText className="text-4xl mb-2" />
            <p className="mb-4">PDF Viewer</p>
            <a
              href={url}
              download={file_name}
              className="flex items-center px-4 py-2 mb-4 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Download PDF
              <Download className="ml-2 h-4 w-4" />
            </a>
            <div className="w-full max-w-3xl h-96 border border-gray-300 rounded">
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                  url
                )}&embedded=true`}
                className="w-full h-full"
                title="PDF Viewer"
              />
            </div>
          </div>
          <DescriptionContent description={description} />
        </>
      );
    case ".csv":
      return (
        <>
          <div className="flex flex-col items-center justify-center p-4">
            <FileText className="text-4xl mb-2" />
            <p className="mb-4">CSV Viewer</p>
            <a
              href={url}
              download={file_name}
              className="flex items-center px-4 py-2 mb-4 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Download CSV
              <Download className="ml-2 h-4 w-4" />
            </a>
            <div className="w-full max-w-3xl h-96 border border-gray-300 rounded">
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                  url
                )}&embedded=true`}
                className="w-full h-full"
                title="CSV Viewer"
              />
            </div>
          </div>
          <DescriptionContent description={description} />
        </>
      );
    default:
      return (
        <>
          <FileText className="text-4xl" />
          Sorry No Preview Available
          <DescriptionContent description={description} />
        </>
      );
  }
};

const DescriptionContent = ({ description }: { description: string }) => {
  return (
    <div className="rounded-lg p-2 bg-white max-h-96 overflow-auto">
      <div className="space-y-1 text-sm">
        <p className="text-sm ">{description}</p>
      </div>
    </div>
  );
};
