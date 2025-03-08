// MarkdownRenderer.tsx
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
		<Box
			borderRadius="lg"
			mx="auto"
			overflow="hidden"
			p={2}
		>
			<Collapse in={show} startingHeight={60}>
				<ReactMarkdown
					components={{
						h1: ({ node, ...props }) => (
							<Heading
								as="h1"
								my={4}
								size="2xl"
								{...props}
							/>
						),
						h2: ({ node, ...props }) => (
							<Heading
								as="h2"
								my={4}
								size="xl"
								{...props}
							/>
						),
						h3: ({ node, ...props }) => (
							<Heading
								as="h3"
								my={4}
								size="lg"
								{...props}
							/>
						),
						p: ({ node, ...props }) => <Text my={2} {...props} />,
						ul: ({ node, ...props }) => (
							<List
								pl={4}
								styleType="disc"
								{...props}
							/>
						),
						ol: ({ node, ...props }) => (
							<List
								pl={4}
								styleType="decimal"
								{...props}
							/>
						),
						li: ({ node, ...props }) => <ListItem {...props} />,
						code: ({ node, ...props }) => <Code {...props} />,
					}}
					remarkPlugins={[remarkGfm]}
				>
					{content}
				</ReactMarkdown>
			</Collapse>
			{!collapse && (
				<Button
					mb={4}
					onClick={handleToggle}
					size="xs"
				>
					{show ? "Collapse" : "Expand"}
				</Button>
			)}
		</Box>
	);
};

export default MarkdownRenderer;
