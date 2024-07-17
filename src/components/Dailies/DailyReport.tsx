import React, { useState, useEffect, use } from "react";
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
import ProcessHistoryButton from "../Schedule/ProcessHistory/ProcessHistoryButton";
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
    })
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [previewCardContent, setPreviewCardContent] =
    useState<UpdateProperties | null>(null);
  const [objectView, setObjectView] = useState<string>("content");
  const [updateType, setUpdateType] = useState<"ACTION" | "MESSAGE" | "IMPACT">(
    "ACTION"
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
    update: UpdateProperties
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
        position="absolute"
        left={`${x}px`}
        top={`${y}px`}
        zIndex="popover"
        background="white"
        borderRadius="md"
        boxShadow="md"
        flexDirection="column"
      >
        <Flex
          p="2"
          cursor="pointer"
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
        w="full"
        justifyContent={"center"}
        h={"full"}
        // alignItems={"center"}
        direction={"column"}
      >
        <Flex alignItems={"center"} justifyContent={"space-between"} gap="4">
          <Flex alignItems={"center"}>
            {update?.type === "email" && (
              <Icon as={MdOutlineEmail} mr={"0.5"} boxSize={"3"} />
            )}
            {update?.type === "message" && (
              <Icon as={MdOutlineMessage} mr={"0.5"} boxSize={"3"} />
            )}
            {update?.type === "note" && (
              <Icon as={MdOutlineNote} mr={"0.5"} boxSize={"3"} />
            )}
            {update?.type === "file" && (
              <Icon as={MdOutlineInsertDriveFile} mr={"0.5"} boxSize={"3"} />
            )}
            {update?.type === "daily" && (
              <Icon as={MdOutlineInsertDriveFile} mr={"0.5"} boxSize={"3"} />
            )}
            <Text fontSize={"10px"} fontStyle={"italic"}>
              {update.type}
            </Text>
          </Flex>
          <Flex>
            <Flex
              fontSize={"10px"}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              {convertDateToTimeText(update.created_at)}
            </Flex>
            <Icon as={MdFiberNew} color={"purple.400"} boxSize={"5"} ml={"2"} />
          </Flex>
        </Flex>
        <Text fontSize={"12px"} my={"2"} fontWeight={"semibold"}>
          {update.update.message + "..."}
        </Text>

        <Flex>
          <Text fontSize={"10px"} mr={"1"}>
            Status:
          </Text>
          <Text
            fontSize={"10px"}
            fontWeight={"bold"}
            color={`${update.update.status === "negative" ? "red" : ""}`}
          >
            {update.update.status}
          </Text>
        </Flex>
      </Flex>
    );
  };

  return (
    <Grid templateColumns="repeat(6, 1fr)" gap={4} w="full">
      <GridItem
        colSpan={6}
        h="full"
        overflowY={"auto"}
        className="custom-scrollbar"
      >
        {previewCardContent && (
          <Flex direction={"column"}>
            <UpdateViewer
              previewCardContent={previewCardContent}
              setPreviewCardContent={setPreviewCardContent}
              setUpdateType={setUpdateType}
            />
          </Flex>
        )}

        {!previewCardContent && (
          <Flex gap="2" flexDir={"column"}>
            <Flex
              alignItems={"center"}
              mb={"2"}
              justifyContent={"space-between"}
              ml={"2"}
            >
              <Text fontSize={"14px"} fontWeight={"bold"}>
                My Notes
              </Text>
            </Flex>
            <Flex gap="2">
              {updates &&
                updates.length > 0 &&
                updates.map((update) => (
                  <Flex
                    key={update.id}
                    onClick={() => {
                      setPreviewCardContent(update);
                      setUpdateType("ACTION");
                    }}
                    onContextMenu={(e: React.MouseEvent<HTMLDivElement>) =>
                      handleRightClick(e, update)
                    }
                    mb={"2"}
                    p={"4"}
                    background={"brand.background"}
                    dropShadow={"lg"}
                    cursor={"pointer"}
                    display="flex"
                    flexDirection="column"
                    borderRadius={"md"}
                    _hover={{ bg: "brand.dark", color: "white" }}
                  >
                    {previewCard(update)}
                  </Flex>
                ))}
            </Flex>
            <Flex
              alignItems={"center"}
              mb={"2"}
              justifyContent={"space-between"}
              ml={"2"}
            >
              <Text fontSize={"14px"} fontWeight={"bold"}>
                Daily Reports
              </Text>
            </Flex>
            <Flex gap="2">
              {updates &&
                updates.length > 0 &&
                updates.map((update) => (
                  <Flex
                    key={update.id}
                    onClick={() => {
                      setPreviewCardContent(update);
                      setUpdateType("ACTION");
                    }}
                    onContextMenu={(e: React.MouseEvent<HTMLDivElement>) =>
                      handleRightClick(e, update)
                    }
                    mb={"2"}
                    p={"4"}
                    background={"brand.background"}
                    dropShadow={"lg"}
                    cursor={"pointer"}
                    display="flex"
                    flexDirection="column"
                    borderRadius={"md"}
                    _hover={{ bg: "brand.dark", color: "white" }}
                  >
                    {previewCard(update)}
                  </Flex>
                ))}
            </Flex>
            {contextMenu.isVisible && (
              <ContextMenu x={contextMenu.x} y={contextMenu.y} />
            )}

            <Flex flexDir={"column"}>
              <Flex
                alignItems={"center"}
                mb={"2"}
                justifyContent={"space-between"}
                ml={"2"}
              >
                <Text fontSize={"14px"} fontWeight={"bold"}>
                  Schedule Impact Analysis
                </Text>
              </Flex>
              <Flex gap="2">
                {updates &&
                  updates.length > 0 &&
                  updates.map((update) => (
                    <Flex
                      key={update.id}
                      onClick={() => {
                        setPreviewCardContent(update);
                        setUpdateType("IMPACT");
                      }}
                      onContextMenu={(e: React.MouseEvent<HTMLDivElement>) =>
                        handleRightClick(e, update)
                      }
                      mb={"2"}
                      p={"4"}
                      background={"brand.background"}
                      dropShadow={"lg"}
                      cursor={"pointer"}
                      display="flex"
                      flexDirection="column"
                      borderRadius={"md"}
                      _hover={{ bg: "brand.dark", color: "white" }}
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
          rounded={"lg"}
          colSpan={6}
          h="full"
          overflowY={"scroll"}
          className="custom-scrollbar"
        >
          <Flex
            w={"full"}
            py={"2"}
            px={"4"}
            bg={"brand.background"}
            rounded={"lg"}
            overflowY={"auto"}
            className="custom-scrollbar"
            direction={"column"}
            h="full"
          >
            {updateType === "ACTION" && (
              <Flex h="80vh" overflow={"scroll"}>
                {previewCardContent.document_access_id && (
                  <EditorBlock
                    id={previewCardContent.document_access_id}
                    previewCardContent={previewCardContent}
                  />
                )}
              </Flex>
            )}
            {updateType === "MESSAGE" && (
              <Flex>
                <DailyMessageQueue />
              </Flex>
            )}
            {updateType === "IMPACT" && (
              <Flex flexDirection="column" h="80vh" overflow={"scroll"}>
                <Flex justifyContent={"right"}>
                  <Button
                    size="xs"
                    colorScheme="yellow"
                    onClick={() => syncImpact(previewCardContent.created_at)}
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
