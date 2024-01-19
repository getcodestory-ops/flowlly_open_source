import React from "react";
import {
  Flex,
  Grid,
  GridItem,
  Select,
  SelectField,
  Input,
  Icon,
  Button,
} from "@chakra-ui/react";
import { BsSend } from "react-icons/bs";

function AiActions() {
  return (
    <Grid
      h={"full"}
      templateRows="repeat(7, 1fr)"
      gap={0}
      bgGradient="linear(brand.gray 5%, white 30% )"
      rounded={"2xl"}
      boxShadow={"lg"}
    >
      <GridItem rowSpan={1} pt={"4"} px={"4"}>
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
      <GridItem
        rowSpan={1}
        display="flex"
        flexDirection="column"
        justifyContent="end"
        pb={"2"}
        px={"2"}
      >
        <Flex
          alignItems={"center"}
          bg={"brand.background"}
          p={"2"}
          rounded={"xl"}
        >
          <Input
            size={"sm"}
            border={"white"}
            rounded={"lg"}
            placeholder="Flowlly help me ..."
            className="custom-selector"
          ></Input>

          <Button
            rounded={"full"}
            bg={"white"}
            _hover={{ bg: "brand.dark", color: "white" }}
          >
            <Icon as={BsSend} fontSize={"22px"}></Icon>
          </Button>
        </Flex>
      </GridItem>
    </Grid>
  );
}

export default AiActions;
