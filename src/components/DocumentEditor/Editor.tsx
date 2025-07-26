import React, { useEffect, useState } from "react";

import { Flex, Text, Spinner, HStack } from "@chakra-ui/react";
import { useContentSave } from "./useContentSave";

import ContentEditor from "./ContentEditor";
import LoaderAnimation from "@/components/Animations/LoaderAnimation";
interface EditorBlockProps {
  previewCardContent?: any;
  id?: string | string[];
  noteTitle?: string;
}

const EditorBlock = ({ id }: EditorBlockProps) => {
	const { content, isLoading, onSubmit } = useContentSave(id);
	const [key, setKey] = useState(0);

	useEffect(() => {
		setKey(key + 1);
	}, [id, content]);

	return (
		<Flex
			flexDirection="column"
			h="full"
			overflowY="auto"
			p="2"
			sx={{
				"&::-webkit-scrollbar": {
					width: "0px",
					borderRadius: "0px",
					backgroundColor: "rgba(0, 0, 0, 0.01)",
				},
			}}
			w="full"
		>
			{content && !isLoading && (
				<ContentEditor
					content={content}
					documentType="Daily Report"
					key={key}
					saveFunction={onSubmit}
					showComments
				/>
			)}
			{isLoading && (
				<HStack gap="4">
					<LoaderAnimation />
				</HStack>
			)}
		</Flex>
	);
};

export default EditorBlock;
