import React from "react";
import EditorBlock from "@/components/DocumentEditor/Editor";
import NoteEditor from "@/components/DocumentEditor/BlockNoteEditor";
import { Button, Flex, Tooltip, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useStore } from "@/utils/store";

interface EditorProps {
  documentTitle?: string;
}

function Editor({ documentTitle }: EditorProps) {
  const { documentId, setDocumentId } = useStore((state) => ({
    documentId: state.documentId,
    setDocumentId: state.setDocumentId,
  }));
  // const router = useRouter();

  // const { id, title } = router.query;

  // const newId = "0bd66501-0f12-408f-a532-6e4f0f3305d3";

  return (
    <Flex>
      {/* <Flex
        py="4"
        fontSize="xl"
        fontWeight="bold"
        borderBottom={"2px solid"}
        borderColor="brand.light"
      >
        {title}
      </Flex> */}
      <EditorBlock id={documentId} noteTitle={documentTitle} />
    </Flex>
  );
}

export default Editor;
