import React, { useEffect, useState } from "react";
import PdfLoader from "@/components/PdfLoader";
import SearchPanel from "@/components/SearchPanel";
import DraggablePaneDivider from "@/components/DraggablePaneDivider";
import { useStore } from "@/utils/store";
import { Flex } from "@chakra-ui/react";

function SearchInterface() {
  const pdfViewer = useStore((state) => state.pdfViewer);
  const { isPdfVisible } = pdfViewer;

  return (
    <Flex w={"1200px"}>
      {!isPdfVisible && <SearchPanel />}
      {isPdfVisible && (
        <DraggablePaneDivider LeftPanel={SearchPanel} RightPanel={PdfLoader} />
      )}
    </Flex>
  );
}

export default SearchInterface;
