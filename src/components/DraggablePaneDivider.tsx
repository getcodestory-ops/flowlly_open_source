import React, { useState, useRef, useEffect } from "react";
import { Box, Flex } from "@chakra-ui/react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";

interface PaneProps {
  children: React.ReactNode;
  [x: string]: any;
}

interface DraggablePaneDividerProps {
  LeftPanel: React.ComponentType;
  RightPanel: React.ComponentType;
}

const Pane: React.FC<PaneProps> = ({ children, ...rest }) => (
  <Box {...rest}>{children}</Box>
);

const DraggablePaneDivider: React.FC<DraggablePaneDividerProps> = ({
  LeftPanel,
  RightPanel,
}) => {
  const [paneWidth, setPaneWidth] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Set the initial state here where `window` object is available.
    setPaneWidth(window.innerWidth / 2);
  }, []);

  if (paneWidth === null) return null;

  const handleDrag = (_: any, data: DraggableData) => {
    setPaneWidth((prevWidth) => prevWidth! + data.deltaX);
  };

  return (
    <Flex flexDirection={{ base: "column", md: "row" }} height="100vh">
      <Flex width={paneWidth}>
        <LeftPanel />
      </Flex>
      <Draggable
        axis="x"
        position={{ x: 0, y: 0 }}
        onDrag={handleDrag}
        nodeRef={ref}
        onStart={() => setIsDragging(true)}
        onStop={() => setIsDragging(false)}
      >
        <Flex
          ref={ref}
          cursor="ew-resize"
          width="10px"
          zIndex="10"
          backgroundColor={isDragging ? "none" : "gray"}
        />
      </Draggable>
      <Flex
        flex="1"
        maxWidth={window.innerWidth - paneWidth - 100}
        zIndex={"overlay"}
      >
        <RightPanel />
      </Flex>
    </Flex>
  );
};

export default DraggablePaneDivider;
