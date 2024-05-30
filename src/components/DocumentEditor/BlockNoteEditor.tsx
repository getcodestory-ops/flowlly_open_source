import { BlockNoteEditor } from "@blocknote/core";
// import { BlockNoteView, useBlockNote } from "yar/react";
import "@blocknote/core/style.css";
import { Button, Flex } from "@chakra-ui/react";

function NoteEditor() {
  // const editor: BlockNoteEditor = useBlockNote();

  return (
    <Flex minW="600px">
      {/* <BlockNoteView editor={editor} theme={"light"} /> */}
    </Flex>
  );
}

export default NoteEditor;
