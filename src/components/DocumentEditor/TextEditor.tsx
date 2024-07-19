import React, { memo, useEffect, useRef, useState, useCallback } from "react";
import { Flex } from "@chakra-ui/react";
import { useContentSave } from "./useContentSave";

import { useStore } from "@/utils/store";
import type EditorJS from "@editorjs/editorjs";

interface EditorBlockProps {
  previewCardContent?: any;
  id?: string | string[];
  noteTitle?: string;
}

const TextEditor = ({
  previewCardContent,
  id,
  noteTitle,
}: EditorBlockProps) => {
  const { appView } = useStore((state) => ({
    appView: state.appView,
  }));
  const holder = "editorjs-container";
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const ref = useRef<EditorJS>();
  const { data } = useContentSave(id);

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
  }, [ref, data]);

  useEffect(() => {
    const init = async () => {
      await initializeEditor();
    };
    if (isMounted) {
      init();

      return () => {
        if (ref.current && ref.current?.destroy) {
          ref.current?.destroy();
          ref.current = undefined;
        }
      };
    }
  }, [ref, isMounted, initializeEditor]);

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

export default memo(TextEditor);
