// MarkdownRenderer.tsx
import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
  collapse?: boolean;
}

const MarkDownDisplay: React.FC<MarkdownRendererProps> = ({
  content,
  collapse = false,
}) => {
  return (
    <div
      style={{
        padding: "8px",
        borderRadius: "8px",
        overflow: "hidden", // Ensures content doesn't overflow the container
      }}
    >
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1
              style={{
                fontSize: "2.25rem",
                fontWeight: "bold",
                margin: "1rem 0",
              }}
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2 style={{ fontSize: "1.875rem", margin: "1rem 0" }} {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3
              style={{
                fontSize: "1.5rem",
                marginTop: "2rem",
                marginBottom: "1rem",
              }}
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4 style={{ fontSize: "1.25rem", margin: "1rem 0" }} {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h5 style={{ fontSize: "1.125rem", margin: "1rem 0" }} {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h6 style={{ fontSize: "1rem", margin: "1rem 0" }} {...props} />
          ),
          p: ({ node, ...props }) => (
            <p
              style={{
                fontSize: "0.875rem",
                fontWeight: "normal",
                margin: "0.5rem 0",
                overflowWrap: "break-word", // Allows long words to break
                wordWrap: "break-word", // Legacy support for older browsers
                hyphens: "auto", // Adds hyphens where appropriate
              }}
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li
              style={{
                fontSize: "0.875rem",
                fontWeight: "normal",
                margin: "0.75rem 1.5rem",
                overflowWrap: "break-word",
                wordWrap: "break-word",
                hyphens: "auto",
              }}
              {...props}
            />
          ),
          code: ({ node, className, ...props }) => (
            <code
              style={{
                padding: "1em",
                backgroundColor: "#f6f8fa",
                borderRadius: "3px",
                fontSize: "85%",
                overflowX: "auto",
                display: "block",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
              }}
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
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
