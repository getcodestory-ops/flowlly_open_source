// MarkdownRenderer.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  collapse?: boolean;
}

const MarkDownDisplay: React.FC<MarkdownRendererProps> = ({
  content,
  collapse = false,
}) => {
  return (
    <div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        className=" m-2 w-full prose prose-sm max-w-none 
                prose-headings:mb-2 prose-headings:mt-1.5 
                prose-p:my-0.5 prose-p:leading-relaxed
                prose-li:my-0 
                prose-ol:pl-5
                prose-ol:list-decimal
                prose-headings:text-gray-800
                prose-p:text-gray-700
                prose-strong:text-gray-800
                prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                prose-code:bg-gray-100 prose-code:text-gray-900
                prose-pre:bg-gray-100 prose-pre:text-gray-900
                [&>*]:max-w-4xl [&>*]:mx-auto px-2"
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
