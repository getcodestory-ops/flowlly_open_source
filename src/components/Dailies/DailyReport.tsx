import React, { useState } from "react";
import {
	Grid,
	GridItem,
	Text,
	Flex,
	useDisclosure,
	Select,
	Icon,
	Button,
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
import { getUpdates } from "@/api/update_routes";
import { UpdateProperties } from "@/types/updates";
import EditorBlock from "@/components/DocumentEditor/Editor";
import UpdateViewer from "./UpdateViewer";
import DailyMessageQueue from "./DailyMessageQueue";
import ScheduleImpact from "./ScheduleImpact";
import { useScheduleSync } from "@/components/Schedule/SyncSchedule/useScheduleWithProcore";

const DailyReports = () => {
	const { syncImpact } = useScheduleSync();

	const { documentId, setDocumentId, session, activeProject } = useStore(
		(state) => ({
			documentId: state.documentId,
			setDocumentId: state.setDocumentId,
			session: state.session,
			activeProject: state.activeProject,
		}),
	);

	const { isOpen, onOpen, onClose } = useDisclosure();
	const [previewCardContent, setPreviewCardContent] =
    useState<UpdateProperties | null>(null);
	const [objectView, setObjectView] = useState<string>("content");
	const [updateType, setUpdateType] = useState<"ACTION" | "MESSAGE" | "IMPACT">(
		"ACTION",
	);
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
				<Flex
					alignItems="center"
					gap="4"
					justifyContent="space-between"
				>
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
						{update?.type === "daily" && (
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
						<Flex
							alignItems="center"
							fontSize="10px"
							justifyContent="space-between"
						>
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
			display="flex"
			flexDirection="column"
			gap="2"
			h="full"
			templateColumns="repeat(6, 1fr)"
			w="full"
		>
			<GridItem
				className="custom-scrollbar"
				colSpan={6}
				display="flex"
				overflowY="auto"
			>
				{previewCardContent && (
					<Flex direction="column">
						<UpdateViewer
							previewCardContent={previewCardContent}
							setPreviewCardContent={setPreviewCardContent}
							setUpdateType={setUpdateType}
						/>
					</Flex>
				)}
				{!previewCardContent && (
					<Flex flexDir="column" gap="2">
						<Flex
							alignItems="center"
							justifyContent="space-between"
							mb="2"
							ml="2"
						>
							<Text fontSize="14px" fontWeight="bold">
                My Notes
							</Text>
						</Flex>
						<Flex gap="2">
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
                		onClick={() => {
                			setPreviewCardContent(update);
                			setUpdateType("ACTION");
                		}}
                		onContextMenu={(e: React.MouseEvent<HTMLDivElement>) =>
                			handleRightClick(e, update)
                		}
                		p="4"
                	>
                		{previewCard(update)}
                	</Flex>
                ))}
						</Flex>
						<Flex
							alignItems="center"
							justifyContent="space-between"
							mb="2"
							ml="2"
						>
							<Text fontSize="14px" fontWeight="bold">
                Daily Reports
							</Text>
						</Flex>
						<Flex gap="2">
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
                		onClick={() => {
                			setPreviewCardContent(update);
                			setUpdateType("ACTION");
                		}}
                		onContextMenu={(e: React.MouseEvent<HTMLDivElement>) =>
                			handleRightClick(e, update)
                		}
                		p="4"
                	>
                		{previewCard(update)}
                	</Flex>
                ))}
						</Flex>
						{contextMenu.isVisible && (
							<ContextMenu x={contextMenu.x} y={contextMenu.y} />
						)}
						<Flex flexDir="column">
							<Flex
								alignItems="center"
								justifyContent="space-between"
								mb="2"
								ml="2"
							>
								<Text fontSize="14px" fontWeight="bold">
                  Schedule Impact Analysis
								</Text>
							</Flex>
							<Flex gap="2">
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
                  		onClick={() => {
                  			setPreviewCardContent(update);
                  			setUpdateType("IMPACT");
                  		}}
                  		onContextMenu={(e: React.MouseEvent<HTMLDivElement>) =>
                  			handleRightClick(e, update)
                  		}
                  		p="4"
                  	>
                  		{previewCard(update)}
                  	</Flex>
                  ))}
							</Flex>
							{contextMenu.isVisible && (
								<ContextMenu x={contextMenu.x} y={contextMenu.y} />
							)}
						</Flex>
					</Flex>
				)}
			</GridItem>
			{previewCardContent && previewCardContent.update && (
				<GridItem
					className="custom-scrollbar"
					colSpan={6}
					display="flex"
					flexGrow={1}
					h="full"
					overflowY="scroll"
					rounded="lg"
				>
					<Flex
						bg="brand.background"
						className="custom-scrollbar"
						direction="column"
						h="full"
						overflowY="auto"
						rounded="lg"
						w="full"
					>
						{updateType === "ACTION" && (
							<Flex overflow="scroll" w="full">
								{previewCardContent.document_access_id && (
									<EditorBlock id={previewCardContent.document_access_id} />
								)}
							</Flex>
						)}
						{updateType === "MESSAGE" && (
							<Flex>
								<DailyMessageQueue />
							</Flex>
						)}
						{updateType === "IMPACT" && (
							<Flex
								flexDirection="column"
								h="80vh"
								overflow="scroll"
							>
								<Flex justifyContent="right">
									<Button
										colorScheme="yellow"
										onClick={() => syncImpact(previewCardContent.created_at)}
										size="xs"
									>
                    Sync to procore
									</Button>
								</Flex>
								<ScheduleImpact impactDate={previewCardContent.created_at} />
							</Flex>
						)}
					</Flex>
				</GridItem>
			)}
		</Grid>
	);
};

export default DailyReports;
