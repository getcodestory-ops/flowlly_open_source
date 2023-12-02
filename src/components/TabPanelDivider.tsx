import React, { useState, useRef, useEffect } from "react";
import { Box, Flex } from "@chakra-ui/react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";

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

const TabPanelDivider: React.FC<DraggablePaneDividerProps> = ({
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
      <Tabs isFitted variant="enclosed" height="100vh">
        <TabList fontSize={"xs"}>
          <Tab>Activities Details</Tab>
          <Tab>Gantt View</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <LeftPanel />
          </TabPanel>
          <TabPanel>
            <RightPanel />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

export default TabPanelDivider;
