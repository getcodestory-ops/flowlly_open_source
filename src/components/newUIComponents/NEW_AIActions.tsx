import React from "react";
import { Flex, Grid, GridItem, Select, SelectField } from "@chakra-ui/react";

function AiActions() {
  return (
    <Grid
      h={"full"}
      templateRows="repeat(6, 1fr)"
      gap={4}
      bg={"brand.gray"}
      rounded={"2xl"}
    >
      <GridItem rowSpan={1} p={"4"}>
        <Flex direction={"column"} h={"full"} justifyContent={"flex-end"}>
          <Flex fontSize={"22px"} fontWeight={"bold"} mb={"2"}>
            AI Actions
          </Flex>
          <Flex>
            <Select
              mr={"2"}
              size={"sm"}
              bg={"white"}
              border={"white"}
              rounded={"lg"}
              className="custom-selector"
            >
              <option value="search">Search</option>
              <option value="analyze">Analyze Document</option>
              <option value="email">Draft Email</option>
            </Select>
            <Select
              size={"sm"}
              bg={"white"}
              border={"white"}
              rounded={"lg"}
              placeholder="Folder or File"
              className="custom-selector"
            >
              <option value="option1">Option 1</option>
            </Select>
          </Flex>
        </Flex>
      </GridItem>
      <GridItem rowSpan={5} />
    </Grid>
  );
}

export default AiActions;
