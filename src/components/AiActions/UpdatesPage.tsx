import React, { useState } from "react";
import {
	Grid,
	GridItem,
	Text,
	Flex,
	useDisclosure,
	Select,
	Icon,
} from "@chakra-ui/react";
import {
	MdOutlineEmail,
	MdOutlineMessage,
	MdOutlineNote,
	MdOutlineInsertDriveFile,
	MdFiberNew,
} from "react-icons/md";

import { useStore } from "@/utils/store";
import { convertDateToTimeText } from "@/utils/timeSinceLatestSignificantEvent";
import { useQuery } from "@tanstack/react-query";
import ProcessHistoryButton from "../Schedule/ProcessHistory/ProcessHistoryButton";
import { getUpdates } from "@/api/update_routes";
import { UpdateProperties } from "@/types/updates";
import EditorBlock from "@/components/DocumentEditor/Editor";

const UpdatesPage = () => {
	const { documentId, setDocumentId, session, activeProject } = useStore(
		(state) => ({
			documentId: state.documentId,
			setDocumentId: state.setDocumentId,
			session: state.session,
			activeProject: state.activeProject,
		}),
	);

	const { isOpen, onOpen, onClose } = useDisclosure();
	const [previewCardContent, setPreviewCardContent] = useState<
    Record<string, any>
  >({});
	const [objectView, setObjectView] = useState<string>("content");
	const [contextMenu, setContextMenu] = useState({
		isVisible: false,
		x: 0,
		y: 0,
		id: "",
	});
	const {
		data: updates,
		isLoading,
		isSuccess,
	} = useQuery({
		queryKey: ["updates", session, activeProject],
		queryFn: () => {
			if (!session || !activeProject) {
				return Promise.reject("Set session first !");
			}

			return getUpdates(session, activeProject.project_id);
		},

		enabled: !!session?.access_token && !!activeProject?.project_id,
	});

	const handleRightClick = (
		e: React.MouseEvent<HTMLDivElement>,
		update: UpdateProperties,
	) => {
		e.preventDefault(); // Prevent default context menu
		setContextMenu({
			isVisible: true,
			x: e.pageX,
			y: e.pageY,
			id: update.id,
		});
	};

	const ContextMenu = ({ x, y }: { x: number; y: number }) => {
		return (
			<Flex
				background="white"
				borderRadius="md"
				boxShadow="md"
				flexDirection="column"
				left={`${x}px`}
				position="absolute"
				top={`${y}px`}
				zIndex="popover"
			>
				<Flex
					cursor="pointer"
					p="2"
					_hover={{ bg: "gray.100" }}
					// onClick={onDelete}
				>
          Delete
				</Flex>
			</Flex>
		);
	};

	const previewCard = (update: UpdateProperties) => {
		return (
			<Flex
				justifyContent="center"
				w="full"
				h="full"
				// alignItems={"center"}
				direction="column"
			>
				<Flex alignItems="center" justifyContent="space-between">
					<Flex alignItems="center">
						{update?.type === "email" && (
							<Icon
								as={MdOutlineEmail}
								boxSize="3"
								mr="0.5"
							/>
						)}
						{update?.type === "message" && (
							<Icon
								as={MdOutlineMessage}
								boxSize="3"
								mr="0.5"
							/>
						)}
						{update?.type === "note" && (
							<Icon
								as={MdOutlineNote}
								boxSize="3"
								mr="0.5"
							/>
						)}
						{update?.type === "file" && (
							<Icon
								as={MdOutlineInsertDriveFile}
								boxSize="3"
								mr="0.5"
							/>
						)}
						<Text fontSize="10px" fontStyle="italic">
							{update.type}
						</Text>
					</Flex>
					<Flex>
						<Flex fontSize="10px">
							{convertDateToTimeText(update.created_at)}
						</Flex>
						<Icon
							as={MdFiberNew}
							boxSize="5"
							color="purple.400"
							ml="2"
						/>
					</Flex>
				</Flex>
				<Text
					fontSize="12px"
					fontWeight="semibold"
					my="2"
				>
					{update.update.message + "..."}
				</Text>
				<Flex>
					<Text fontSize="10px" mr="1">
            Status:
					</Text>
					<Text
						color={`${update.update.status === "negative" ? "red" : ""}`}
						fontSize="10px"
						fontWeight="bold"
					>
						{update.update.status}
					</Text>
				</Flex>
			</Flex>
		);
	};

	return (
		<Grid
			gap={4}
			h="full"
			templateColumns="repeat(6, 1fr)"
			w="full"
		>
			<GridItem
				className="custom-scrollbar"
				colSpan={2}
				h="full"
				overflowY="auto"
			>
				<Flex
					alignItems="center"
					justifyContent="space-between"
					mb="2"
				>
					<Text fontSize="14px" fontWeight="bold">
            Reports
					</Text>
					<Flex gap="2">
						<ProcessHistoryButton />
						{/* <ConfigureDailyUpdate /> */}
					</Flex>
				</Flex>
				<Flex alignItems="center" mb="2">
					<Text fontSize="12px" fontWeight="bold">
            Filter:
					</Text>
					<Select
						className="custom-selector"
						size="xs"
						w="90px"
					>
						<option value="all">All</option>
						<option value="email">Email</option>
						<option value="message">Message</option>
						<option value="note">Note</option>
						<option value="note">File</option>
					</Select>
				</Flex>
				<Flex direction="column">
					{updates &&
            updates.length > 0 &&
            updates.map((update) => (
            	<Flex
            		_hover={{ bg: "brand.dark", color: "white" }}
            		background="brand.background"
            		borderRadius="md"
            		cursor="pointer"
            		display="flex"
            		dropShadow="lg"
            		flexDirection="column"
            		key={update.id}
            		mb="2"
            		onClick={() => setPreviewCardContent(update)}
            		onContextMenu={(e: React.MouseEvent<HTMLDivElement>) =>
            			handleRightClick(e, update)
            		}
            		p="2"
            		w="full"
            	>
            		{previewCard(update)}
            	</Flex>
            ))}
					{contextMenu.isVisible && (
						<ContextMenu x={contextMenu.x} y={contextMenu.y} />
					)}
				</Flex>
			</GridItem>
			<GridItem
				colSpan={4}
				h="full"
				rounded="lg"
				overflowY="scroll"

				// className="custom-shadow"
			>
				<Flex h="full">
					{!Object.keys(previewCardContent).length && (
						<Flex
							alignItems="center"
							bg="brand.background"
							className="custom-scrollbar"
							direction="column"
							h="full"
							justifyContent="center"
							overflowY="auto"
							px="4"
							py="2"
							rounded="lg"
							w="full"
						>
							<Text
								color="gray.300"
								fontSize="36px"
								fontWeight="black"
							>
                Select Update from the list
							</Text>
						</Flex>
					)}
					{Object.keys(previewCardContent).length > 0 &&
            previewCardContent.update && (
						<Flex
							bg="brand.background"
							className="custom-scrollbar"
							direction="column"
							h="full"
							overflowY="auto"
							px="4"
							py="2"
							rounded="lg"
							w="full"
						>
							<Flex>
								{previewCardContent.document_access_id && (
									<EditorBlock
										id={previewCardContent.document_access_id}
										previewCardContent={previewCardContent}
									/>
								)}
							</Flex>
						</Flex>
					)}
				</Flex>
			</GridItem>
		</Grid>
	);
};

export default UpdatesPage;
