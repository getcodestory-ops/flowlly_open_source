import React, { useState, useEffect, useMemo, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import supabase from "@/utils/supabaseClient";
import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import {
  AiOutlineLeft,
  AiOutlineRight,
  AiOutlineClose,
  AiOutlinePlus,
  AiOutlineMinus,
} from "react-icons/ai";
import { useStore } from "@/utils/store";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const pdfjsOptions = pdfjs.GlobalWorkerOptions;
const pdfjsVersion = pdfjs.version;
pdfjsOptions.workerSrc =
  "//unpkg.com/pdfjs-dist@" +
  String(pdfjsVersion) +
  "/legacy/build/pdf.worker.min.js";

const VirtualPdfLoader = () => {
  const { pdfViewer, userId, selectedFolder, setPdfViewer, selectedContext } =
    useStore((state) => ({
      pdfViewer: state.pdfViewer,
      userId: state.session?.user.id!,
      selectedFolder: state.selectedContext,
      setPdfViewer: state.setPdfViewer,
      selectedContext: state.selectedContext,
    }));

  const { isPdfVisible, filePath, pageNumber, highlightDetails } = pdfViewer;
  const [scale, setScale] = useState<number>(1.0);
  const pageRefs = useRef<HTMLElement[] | null>([]); // Array to hold refs for all pages
  const [pdfUrl, setPdfUrl] = useState<string | undefined>();
  const [numPages, setNumPages] = useState<number>(1);
  const [isHighlightVisible, setHighlightVisibility] = useState<Boolean>(true);

  useEffect(() => {
    async function setUrlForPdf() {
      if (!selectedContext?.id || !filePath) return;

      if (!userId && !selectedFolder) return;

      const { data: downloadUrl } = await supabase.storage
        .from(`users/${selectedContext.id}`)
        .createSignedUrl(filePath, 60);

      setPdfUrl(downloadUrl?.signedUrl);
    }

    setUrlForPdf();
  }, [filePath, userId, selectedFolder]);

  useEffect(() => {
    setHighlightVisibility(true);
  }, [highlightDetails]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    if (pageRefs.current && pageRefs.current[pageNumber - 1]) {
      (pageRefs.current[pageNumber - 1] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [pageNumber]);

  return (
    <Flex>
      {selectedFolder && isPdfVisible && (
        <Box overflow={"auto"} h={"100vh"}>
          <IconButton
            aria-label="Close"
            position={"absolute"}
            icon={<AiOutlineClose />}
            onClick={() => setPdfViewer({ isPdfVisible: false })}
            mb={2}
            ml={-2}
            pl="2"
            color="red.400"
            bg="gray.200"
            zIndex={"popover"}
          />
          <Flex
            position="absolute"
            right="16"
            top="2"
            background="brand.accent"
            px="8"
            py="2"
            borderRadius="lg"
            gap={2}
          >
            <IconButton
              aria-label="zoomout"
              icon={<AiOutlinePlus />}
              onClick={() => setScale((state) => state + 0.2)}
              size={"xs"}
              color="red.400"
              bg="gray.300"
              zIndex="overlay"
            />
            <IconButton
              aria-label="zoomin"
              icon={<AiOutlineMinus />}
              onClick={() => setScale((state) => state - 0.2)}
              size={"xs"}
              color="red.400"
              bg="gray.300"
              zIndex="overlay"
            />
          </Flex>
          <Flex
            alignItems="center"
            flexDir="row"
            overflowX={"auto"}
            overflowY={"auto"}
          >
            <IconButton
              aria-label="move right"
              color="gray.400"
              bg="gray.300"
              icon={<AiOutlineLeft />}
              onClick={() =>
                setPdfViewer({ pageNumber: Math.max(pageNumber - 1, 1) })
              }
              disabled={pageNumber <= 1}
              fontSize="xl"
              position="absolute"
              top="50%"
              zIndex="10"
            />

            <Box width="100%" height="100%">
              {numPages && (
                <Text textAlign={"center"} fontSize="xx-small">
                  Page {pageNumber} of {numPages}
                </Text>
              )}
              {pdfUrl && (
                <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
                  {Array.from({ length: numPages }, (_, i) => i + 1).map(
                    (page) => (
                      <div key={page}>
                        (
                        <div
                          key={page}
                          ref={(el) => {
                            if (pageRefs?.current) {
                              pageRefs.current[page - 1] = el!; // Use non-null assertion operator
                            }
                          }}
                        >
                          <Page
                            pageNumber={page}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            scale={scale}
                          />
                        </div>
                        )
                      </div>
                    )
                  )}
                </Document>
              )}
            </Box>
            <IconButton
              position="absolute"
              top="50%"
              zIndex="10"
              right="4"
              color="gray.400"
              bg="gray.300"
              aria-label="send message"
              icon={<AiOutlineRight />}
              onClick={() => {
                setPdfViewer({
                  pageNumber: Math.min(numPages, pageNumber + 1),
                });
                setHighlightVisibility(false);
              }}
              disabled={pageNumber >= (numPages ?? 1)}
              fontSize="xl"
            />
          </Flex>
        </Box>
      )}
    </Flex>
  );
};

const PdfLoader: React.FC = () => {
  const memoizedPdfLoader = useMemo(() => <VirtualPdfLoader />, []);
  return memoizedPdfLoader;
};

export default PdfLoader;
