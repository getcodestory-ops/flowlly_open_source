// MarkdownRenderer.tsx
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Box,
} from "@chakra-ui/react";

interface MarkdownRendererProps {
  content: string;
  collapse?: boolean;
}

const MarkDownDisplay: React.FC<MarkdownRendererProps> = ({
  content,
  collapse = false,
}) => {
  const [show, setShow] = useState(collapse);

  const handleToggle = () => setShow(!show);

  return (
    <Box
      p={2}
      borderRadius="lg"
      sx={{
        h1: {
          fontSize: "4xl",
          fontWeight: "bold",
        },
        h2: {
          fontSize: "3xl",
        },
        h3: {
          fontSize: "2xl",
          marginTop: "2rem",
          marginBottom: "1rem",
        },
        h4: {
          fontSize: "xl",
        },
        h5: {
          fontSize: "lg",
        },
        h6: {
          fontSize: "md",
        },
        p: {
          fontSize: "sm",
          fontWeight: "normal",
          margin: "0.5rem 0",
        },
        li: {
          fontSize: "sm",
          fontWeight: "normal",
          margin: "0.75rem 1.5rem",
        },
      }}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </Box>
  );
};

export default MarkDownDisplay;

// components={{
//   h1: ({ node, ...props }) => (
//     <Heading as="h1" size="xl" my={4} {...props} />
//   ),
//   h2: ({ node, ...props }) => (
//     <Heading as="h2" size="lg" my={4} {...props} />
//   ),
//   h3: ({ node, ...props }) => (
//     <Heading as="h3" size="md" my={4} {...props} />
//   ),
//   p: ({ node, ...props }) => <Text my={2} {...props} />,
//   ul: ({ node, ...props }) => (
//     <List styleType="disc" pl={4} {...props} />
//   ),
//   ol: ({ node, ...props }) => (
//     <List styleType="decimal" pl={4} {...props} />
//   ),
//   li: ({ node, ...props }) => <ListItem {...props} />,
//   code: ({ node, ...props }) => <Code {...props} />,
// }}
