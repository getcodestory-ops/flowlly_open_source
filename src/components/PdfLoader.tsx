import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import supabase from "@/utils/supabaseClient";

import { Box, Button, Flex, IconButton, Text } from "@chakra-ui/react";
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const bucketName = "uploads";
const pageNum = 2;
interface HighLightInterface {
  total_chunks: number;
  chunk_number: number;
}

interface pdfMetaData {
  filePath: string;
  pageNumber: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  highlightDetails: HighLightInterface | null;
}

const PdfLoader: React.FC<pdfMetaData> = ({
  filePath,
  pageNumber,
  setPageNumber,
  highlightDetails,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | undefined>();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isHighlightVisible, setHighlightVisibility] = useState<Boolean>(true);

  useEffect(() => {
    async function setUrlForPdf() {
      const { data: downloadUrl } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60);

      setPdfUrl(downloadUrl?.signedUrl);
    }

    setUrlForPdf();
  }, [filePath]);

  useEffect(() => {
    setHighlightVisibility(true);
  }, [highlightDetails]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <Flex alignItems="center" flexDir="row">
      <IconButton
        aria-label="send message"
        bg="white"
        icon={<FaChevronCircleLeft />}
        onClick={() => setPageNumber(Math.max(pageNumber - 1, 1))}
        disabled={pageNumber <= 1}
        size="xl"
        position="absolute"
        top="100px"
        zIndex="10"
      />

      <Box>
        {numPages && (
          <Text textAlign={"center"} fontSize="xx-small">
            Page {pageNumber} of {numPages}
          </Text>
        )}
        {pdfUrl && (
          <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pageNumber} renderTextLayer={false} />
            <Flex
              position={"absolute"}
              zIndex="1"
              width="2xl"
              top={`${
                (highlightDetails?.chunk_number! * 80) /
                highlightDetails?.total_chunks!
              }%`}
              bg="yellow.100"
              opacity={isHighlightVisible ? "0.4" : "0"}
              height={`${70 / (highlightDetails?.total_chunks! + 1) + 20}%`}
            ></Flex>
          </Document>
        )}
      </Box>
      <IconButton
        position="absolute"
        top="100px"
        right="4"
        zIndex="10"
        aria-label="send message"
        bg="white"
        icon={<FaChevronCircleRight />}
        onClick={() => {
          setPageNumber(Math.min(pageNumber + 1, numPages ?? 1));
          setHighlightVisibility(false);
        }}
        disabled={pageNumber >= (numPages ?? 1)}
        size="xl"
      />
    </Flex>
  );
};

export default PdfLoader;
