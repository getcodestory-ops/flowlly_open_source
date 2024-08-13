// MarkdownRenderer.tsx
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Box,
  Heading,
  Text,
  List,
  ListItem,
  Code,
  Collapse,
  Button,
} from "@chakra-ui/react";

interface MarkdownRendererProps {
  content: string;
  collapse?: boolean;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  collapse = false,
}) => {
  const [show, setShow] = useState(collapse);

  const handleToggle = () => setShow(!show);

  return (
    <Box mx="auto" p={2} borderRadius="lg" overflow="hidden">
      <Collapse startingHeight={60} in={show}>
        <ReactMarkdown
          components={{
            h1: ({ node, ...props }) => (
              <Heading as="h1" size="2xl" my={4} {...props} />
            ),
            h2: ({ node, ...props }) => (
              <Heading as="h2" size="xl" my={4} {...props} />
            ),
            h3: ({ node, ...props }) => (
              <Heading as="h3" size="lg" my={4} {...props} />
            ),
            p: ({ node, ...props }) => <Text my={2} {...props} />,
            ul: ({ node, ...props }) => (
              <List styleType="disc" pl={4} {...props} />
            ),
            ol: ({ node, ...props }) => (
              <List styleType="decimal" pl={4} {...props} />
            ),
            li: ({ node, ...props }) => <ListItem {...props} />,
            code: ({ node, ...props }) => <Code {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </Collapse>
      {!collapse && (
        <Button onClick={handleToggle} mb={4} size="xs">
          {show ? "Collapse" : "Expand"}
        </Button>
      )}
    </Box>
  );
};

export default MarkdownRenderer;
