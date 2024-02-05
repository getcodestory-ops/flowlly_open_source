import React, { memo, useEffect, useRef, useState, useCallback } from "react";
import { IoIosSave } from "react-icons/io";
import { FcProcess } from "react-icons/fc";
import { TbAnalyzeFilled } from "react-icons/tb";
import UploadVoiceModal from "@/components/VoiceComponent/UploadVoiceModal";
import {
  Flex,
  Button,
  Tooltip,
  Icon,
  Grid,
  GridItem,
  Text,
} from "@chakra-ui/react";
import { useContentSave } from "./useContentSave";
import { IoShareSocialOutline } from "react-icons/io5";
import { useStore } from "@/utils/store";
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

interface EditorBlockProps {
  previewCardContent?: any;
  id?: string | string[];
  noteTitle?: string;
}

const EditorBlock = ({
  previewCardContent,
  id,
  noteTitle,
}: EditorBlockProps) => {
  const { appView } = useStore((state) => ({
    appView: state.appView,
  }));
  const holder = "editorjs-container";
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const { ref, processDoc, data, onSubmit } = useContentSave(id);

  useEffect(() => {
    if (typeof window !== "undefined") setIsMounted(true);
  }, []);

  const initializeEditor = useCallback(async () => {
    const EditorJs = (await import("@editorjs/editorjs")).default;
    const EDITOR_JS_TOOLS = (await import("./constants")).EDITOR_JS_TOOLS;
    if (!ref.current) {
      const editor = new EditorJs({
        inlineToolbar: true,
        holder: holder,
        onReady() {
          ref.current = editor;
        },
        tools: EDITOR_JS_TOOLS,
        data,
        placeholder: "Start writing your document here...",
      });
      onchange;
      ref.current = editor;
    }
  }, [data, id]);

  useEffect(() => {
    const init = async () => {
      await initializeEditor();
    };
    if (isMounted) {
      init();
      if (ref.current) {
        return () => {
          ref.current?.destroy();
          ref.current = undefined;
        };
      }
    }
  }, [isMounted, initializeEditor]);

  return (
    <Flex
      p={"2"}
      w="full"
      h="full"
      overflowY={"scroll"}
      sx={{
        "&::-webkit-scrollbar": {
          width: "0px",
          borderRadius: "0px",
          backgroundColor: `rgba(0, 0, 0, 0.01)`,
        },
      }}
      flexDirection={"column"}
      // alignItems={"flex-end"}
    >
      <Flex
        alignItems={"center"}
        justifyContent={
          previewCardContent || noteTitle ? "space-between" : "flex-end"
        }
      >
        {previewCardContent && (
          <Flex direction={"column"}>
            <Flex alignItems={"center"} mb={"2"}>
              {previewCardContent.type === "email" && (
                <Icon as={MdOutlineEmail} mr={"0.5"} boxSize={"3"} />
              )}
              {previewCardContent.type === "message" && (
                <Icon as={MdOutlineMessage} mr={"0.5"} boxSize={"3"} />
              )}
              {previewCardContent.type === "note" && (
                <Icon as={MdOutlineNote} mr={"0.5"} boxSize={"3"} />
              )}
              {previewCardContent.type === "file" && (
                <Icon as={MdOutlineInsertDriveFile} mr={"0.5"} boxSize={"3"} />
              )}
              <Text fontSize={"12px"} fontStyle={"italic"}>
                {previewCardContent.type}
              </Text>
            </Flex>
            <Text fontSize={"14px"} fontWeight={"bold"} mb={"6"}>
              {previewCardContent.update.message}
            </Text>
          </Flex>
        )}
        {noteTitle && (
          <Flex ml={"4"}>
            <Text fontSize={"14px"} fontWeight={"bold"}>
              {noteTitle}
            </Text>
          </Flex>
        )}
        <Flex>
          {appView === "notes" && <UploadVoiceModal />}

          {/* <Tooltip label="AI Note Analysis" bg="white" color="brand.dark">
          <Button
            mx={"2"}
            boxShadow={"lg"}
            cursor={"pointer"}
            size={"sm"}
            bg={"white"}
            // position="absolute"
            // zIndex={"overlay"}
            // top="32"
            onClick={() => processDoc()}
            _hover={{ bg: "brand.dark", color: "white" }}

            // transform={"translateX(-200%)"}
          >
            <Icon
              as={TbAnalyzeFilled}
              _hover={{
                transform: "rotate(360deg)",

                transition: "transform 0.5s ease-in-out",
              }}
            />
          </Button>
        </Tooltip> */}
          <Tooltip label="Save note" bg="white" color="brand.dark">
            <Button
              onClick={() => onSubmit()}
              mr={"2"}
              cursor={"pointer"}
              size={"sm"}
              bg={"white"}
              boxShadow={"lg"}
              _hover={{ bg: "brand.dark", color: "white" }}
              ml={"2"}
              // top="32"
              // position={"absolute"}
              // zIndex={"overlay"}
            >
              <IoIosSave />
            </Button>
          </Tooltip>
          {/* <Tooltip label="Share note" bg="white" color="brand.dark">
          <Button
            // onClick={() => onSubmit()}
            cursor={"pointer"}
            size={"sm"}
            bg={"white"}
            boxShadow={"lg"}
            _hover={{ bg: "brand.dark", color: "white" }}
            // top="32"
            // position={"absolute"}
            // zIndex={"overlay"}
          >
            <IoShareSocialOutline />
          </Button>
        </Tooltip> */}
        </Flex>
      </Flex>

      <Flex
        w="full"
        sx={{
          h1: {
            fontSize: "4xl",
            fontWeight: "bold",
          },
          h2: {
            fontSize: "3xl",
            fontWeight: "bold",
          },
          h3: {
            fontSize: "2xl",
            fontWeight: "bold",
          },
          h4: {
            fontSize: "xl",
            fontWeight: "bold",
          },
          h5: {
            fontSize: "lg",
            fontWeight: "bold",
          },
          h6: {
            fontSize: "md",
            fontWeight: "bold",
          },
        }}
      >
        <div id={holder} style={{ width: "100%" }} />
      </Flex>
    </Flex>
  );
};

export default memo(EditorBlock);
