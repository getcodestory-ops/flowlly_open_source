import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import supabase from "@/utils/supabaseClient";
import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { AiOutlineLeft, AiOutlineRight, AiOutlineClose } from "react-icons/ai";
import { useStore } from "@/utils/store";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PdfLoader = () => {
  const { pdfViewer, userId, selectedFolder, setPdfViewer, selectedContext } =
    useStore((state) => ({
      pdfViewer: state.pdfViewer,
      userId: state.session?.user.id!,
      selectedFolder: state.selectedContext,
      setPdfViewer: state.setPdfViewer,
      selectedContext: state.selectedContext,
    }));

  const { isPdfVisible, filePath, pageNumber, highlightDetails } = pdfViewer;

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

  return (
    <Flex>
      {selectedFolder && isPdfVisible && (
        <Box maxWidth="50vw" overflow={"auto"}>
          <IconButton
            aria-label="Close"
            icon={<AiOutlineClose />}
            onClick={() => setPdfViewer({ isPdfVisible: false })}
            mb={2}
            ml={-3}
            pl="2"
            color="red.400"
            bg="gray.50"
            zIndex="overlay"
          />
          <Flex
            alignItems="center"
            flexDir="row"
            overflowX={"auto"}
            overflowY={"auto"}
            h={"90%"}
          >
            <IconButton
              aria-label="move right"
              color="gray.400"
              bg="gray.50"
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
                  <Page
                    pageNumber={pageNumber}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
              )}
            </Box>
            <IconButton
              position="absolute"
              top="50%"
              zIndex="10"
              right="4"
              color="gray.400"
              bg="gray.50"
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

export default PdfLoader;
