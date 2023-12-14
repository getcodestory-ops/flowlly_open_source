import React, { memo, useEffect, useRef, useState, useCallback } from "react";
import { IoIosSave } from "react-icons/io";
import { FcProcess } from "react-icons/fc";
import UploadVoiceModal from "@/components/VoiceComponent/UploadVoiceModal";
import { Flex, Button, Tooltip, Icon } from "@chakra-ui/react";
import { useContentSave } from "./useContentSave";

const EditorBlock = ({ id }: { id?: string | string[] }) => {
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
  }, [data]);

  useEffect(() => {
    const init = async () => {
      await initializeEditor();
    };
    if (isMounted) {
      init();
      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);

  return (
    <Flex
      w="full"
      overflowY={"scroll"}
      sx={{
        "&::-webkit-scrollbar": {
          width: "0px",
          borderRadius: "0px",
          backgroundColor: `rgba(0, 0, 0, 0.01)`,
        },
      }}
      py="8"
      flexDirection={"column"}
      alignItems={"flex-end"}
    >
      <Flex position="absolute" transform={"translateX(-400%)"} top="32">
        <UploadVoiceModal documentId={id} />
      </Flex>
      <Tooltip label="Save the document">
        <Button
          onClick={() => onSubmit()}
          cursor={"pointer"}
          size={"md"}
          maxW="16"
          top="32"
          position={"absolute"}
          zIndex={"overlay"}
        >
          <IoIosSave />
        </Button>
      </Tooltip>
      <Tooltip label="Process the document">
        <Button
          cursor={"pointer"}
          size={"md"}
          maxW="16"
          position="absolute"
          zIndex={"overlay"}
          top="32"
          onClick={() => processDoc()}
          transform={"translateX(-200%)"}
        >
          <Icon
            as={FcProcess}
            _hover={{
              transform: "rotate(360deg)",

              transition: "transform 0.5s ease-in-out",
            }}
          />
        </Button>
      </Tooltip>
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
