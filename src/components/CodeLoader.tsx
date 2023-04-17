import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import supabase from "@/utils/supabaseClient";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

import { Box, Button, Flex, IconButton, Text } from "@chakra-ui/react";
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";

const bucketName = "users/userA/code";

interface codeMetaData {
  filePath: string;
}

const CodeLoader: React.FC<codeMetaData> = ({ filePath }) => {
  const [codeFileUrl, setCodeFileUrl] = useState<string | undefined>();
  const [codeFileContent, setCodeFileContent] = useState<string | undefined>();

  useEffect(() => {
    async function setUrlForPdf() {
      const { data: downloadUrl } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60);

      setCodeFileUrl(downloadUrl?.signedUrl);
    }

    setUrlForPdf();
  }, [filePath]);

  useEffect(() => {
    async function fetchFileContent() {
      if (codeFileUrl) {
        const response = await fetch(codeFileUrl);
        const content = await response.text();
        setCodeFileContent(content);
      }
    }

    fetchFileContent();
  }, [codeFileUrl]);

  return (
    <Flex alignItems="center" flexDir="column" width="xl">
      {filePath && (
        <Text color={"gray.400"} fontSize="small">
          <i>{filePath}</i>
        </Text>
      )}
      <Box width="xl">
        {codeFileUrl && (
          <SyntaxHighlighter>{codeFileContent!}</SyntaxHighlighter>
        )}
      </Box>
    </Flex>
  );
};

export default CodeLoader;
