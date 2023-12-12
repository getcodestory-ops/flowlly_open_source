import React from "react";
import EditorBlock from "@/components/DocumentEditor/Editor";
import NoteEditor from "@/components/DocumentEditor/BlockNoteEditor";
import { Button, Flex, Tooltip } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { IoMdArrowRoundBack } from "react-icons/io";

function Editor() {
  const router = useRouter();

  const { id, title } = router.query;

  return (
    <Flex w="full" justifyContent="center">
      <Flex padding="10" w={{ base: "full", "2xl": "7xl" }} direction="column">
        <Flex>
          <Tooltip label="Back" aria-label="Back">
            <Flex
              justifyContent={"start"}
              cursor="pointer"
              onClick={() => router.back()}
            >
              <IoMdArrowRoundBack size="32" />
            </Flex>
          </Tooltip>
        </Flex>
        <Flex
          py="4"
          fontSize="xl"
          fontWeight="bold"
          borderBottom={"2px solid"}
          borderColor="brand.light"
        >
          {title}
        </Flex>
        <EditorBlock id={id} />
      </Flex>
    </Flex>
  );
}

export default Editor;
