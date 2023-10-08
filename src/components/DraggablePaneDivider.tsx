import React, { useState, useRef, useEffect } from "react";
import { Box } from "@chakra-ui/react";
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
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Set the initial state here where `window` object is available.
    setPaneWidth(window.innerWidth / 2);
  }, []);

  if (paneWidth === null) return null;

  const handleDrag = (_: any, data: DraggableData) => {
    setPaneWidth(paneWidth + data.deltaX);
  };

  return (
    <Box display="flex" height="100vh">
      <Pane width={paneWidth} maxWidth="calc(100% - 10px)">
        <LeftPanel />
      </Pane>
      <Draggable
        axis="x"
        position={{ x: 0, y: 0 }}
        onDrag={handleDrag}
        nodeRef={ref}
      >
        <Box
          ref={ref}
          cursor="ew-resize"
          width="10px"
          background="gray.200"
          zIndex="10"
        />
      </Draggable>
      <Pane flex="1">
        {" "}
        <RightPanel />
      </Pane>
    </Box>
  );
};

export default DraggablePaneDivider;
