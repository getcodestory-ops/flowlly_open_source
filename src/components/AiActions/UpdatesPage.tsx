import React, { useState, useEffect, use } from "react";
import {
  Grid,
  GridItem,
  Text,
  Flex,
  useDisclosure,
  Button,
  Tooltip,
  Select,
  Icon,
  Image,
} from "@chakra-ui/react";
import {
  MdOutlinePlayCircleOutline,
  MdOpenInNew,
  MdOutlineEmail,
  MdOutlinePeopleAlt,
  MdOutlineSmsFailed,
  MdOutlineMessage,
  MdOutlineNote,
  MdOutlineInsertDriveFile,
  MdFiberNew,
} from "react-icons/md";

import { useStore } from "@/utils/store";
import { IoDocumentTextOutline, IoPlayCircleOutline } from "react-icons/io5";
import { AiOutlineAlert } from "react-icons/ai";
import { convertDateToTimeText } from "@/utils/timeSinceLatestSignificantEvent";
import { useQuery } from "@tanstack/react-query";
import ProcessHistoryButton from "../Schedule/ProcessHistory/ProcessHistoryButton";
import { getUpdates } from "@/api/update_routes";
import { UpdateProperties } from "@/types/updates";
import EditorBlock from "@/components/DocumentEditor/Editor";
import ConfigureDailyUpdate from "../Schedule/ConfigureTaskQueue/ConfigureDailyUpdate";

const UpdatesPage = () => {
  const { documentId, setDocumentId, session, activeProject } = useStore(
    (state) => ({
      documentId: state.documentId,
      setDocumentId: state.setDocumentId,
      session: state.session,
      activeProject: state.activeProject,
    })
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
        <Flex alignItems={"center"} justifyContent={"space-between"}>
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
            <Text fontSize={"10px"} fontStyle={"italic"}>
              {update.type}
            </Text>
          </Flex>
          <Flex>
            <Flex fontSize={"10px"}>
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
    <Grid templateColumns="repeat(6, 1fr)" gap={4} w="full" h={"full"}>
      <GridItem
        colSpan={2}
        h="full"
        overflowY={"auto"}
        className="custom-scrollbar"
      >
        <Flex alignItems={"center"} mb={"2"} justifyContent={"space-between"}>
          <Text fontSize={"14px"} fontWeight={"bold"}>
            Updates
          </Text>
          <Flex gap="2">
            <ProcessHistoryButton />
            {/* <ConfigureDailyUpdate /> */}
          </Flex>
        </Flex>
        <Flex alignItems={"center"} mb={"2"}>
          <Text fontSize={"12px"} fontWeight={"bold"}>
            Filter:
          </Text>
          <Select size={"xs"} w={"90px"} className="custom-selector">
            <option value="all">All</option>
            <option value="email">Email</option>
            <option value="message">Message</option>
            <option value="note">Note</option>
            <option value="note">File</option>
          </Select>
        </Flex>
        <Flex direction={"column"}>
          {updates &&
            updates.length > 0 &&
            updates.map((update) => (
              <Flex
                key={update.id}
                onClick={() => setPreviewCardContent(update)}
                onContextMenu={(e: React.MouseEvent<HTMLDivElement>) =>
                  handleRightClick(e, update)
                }
                w="full"
                mb={"2"}
                p={"2"}
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
          {contextMenu.isVisible && (
            <ContextMenu x={contextMenu.x} y={contextMenu.y} />
          )}
        </Flex>
      </GridItem>
      <GridItem
        rounded={"lg"}
        colSpan={4}
        h={"full"}
        overflowY={"scroll"}

        // className="custom-shadow"
      >
        <Flex h={"full"}>
          {!Object.keys(previewCardContent).length && (
            <Flex
              w={"full"}
              h={"full"}
              py={"2"}
              px={"4"}
              bg={"brand.background"}
              rounded={"lg"}
              overflowY={"auto"}
              className="custom-scrollbar"
              direction={"column"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Text fontSize={"36px"} color={"gray.300"} fontWeight={"black"}>
                Select Update from the list
              </Text>
            </Flex>
          )}
          {Object.keys(previewCardContent).length > 0 &&
            previewCardContent.update && (
              <Flex
                w={"full"}
                h={"full"}
                py={"2"}
                px={"4"}
                bg={"brand.background"}
                rounded={"lg"}
                overflowY={"auto"}
                className="custom-scrollbar"
                direction={"column"}
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
