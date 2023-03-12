import React from "react";
import { Box, Link } from "@chakra-ui/react";

interface DocumentProps {
  documentData: {
    page_content: string;
    metadata: {
      filename: string;
      page_number: number;
      total_chunks: number;
      chunk_number: number;
    };
  }[];
}

interface HighLightInterface {
  total_chunks: number;
  chunk_number: number;
}

interface ContextDisplayProps extends DocumentProps {
  setPdfVisibility: React.Dispatch<React.SetStateAction<Boolean>>;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  setFilePath: React.Dispatch<React.SetStateAction<string>>;
  setHighlightDetails: React.Dispatch<
    React.SetStateAction<HighLightInterface | null>
  >;
}

const ContextDisplay: React.FC<ContextDisplayProps> = ({
  documentData,
  setPdfVisibility,
  setPageNumber,
  setFilePath,
  setHighlightDetails,
}) => {
  const handleRefereces = (
    pageNumber: number,
    filePath: string,
    total_chunks: number,
    chunk_number: number
  ) => {
    setPageNumber(pageNumber);
    setFilePath(filePath);
    setPdfVisibility(true);
    setHighlightDetails({
      total_chunks: total_chunks,
      chunk_number: chunk_number,
    });
  };

  return (
    <div>
      {documentData.map((page, index) => (
        <div key={`${index}`}>
          <Box
            py="16"
            borderTop={"2px solid gray"}
            lineHeight="7"
            textAlign={"justify"}
            fontFamily="sans"
          >
            {page.page_content}
            <Box>
              <Link
                cursor="pointer"
                onClick={() =>
                  handleRefereces(
                    page.metadata.page_number,
                    page.metadata.filename,
                    page.metadata.total_chunks,
                    page.metadata.chunk_number
                  )
                }
                color="blue.500"
                fontWeight="semibold"
                fontSize="lg"
                _hover={{
                  textDecoration: "underline",
                }}
              >
                Reference -{page.metadata.filename} - page#{" "}
                {page.metadata.page_number}
              </Link>
            </Box>
          </Box>
        </div>
      ))}
    </div>
  );
};

export default ContextDisplay;
