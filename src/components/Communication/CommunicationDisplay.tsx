import React from "react";
import {
  Box,
  Flex,
  Text,
  Textarea,
  Button,
  Icon,
  Input,
  Select,
} from "@chakra-ui/react";

function CommunicationDisplay() {
  return (
    <Flex p={"10"}>
      <Flex direction={"column"}>
        <Text as={"b"} fontSize={"sm"} mb={"2"}>
          Message
        </Text>
        <Textarea
          w={"400px"}
          h={"500px"}
          resize={"none"}
          placeholder="What's the message?"
          focusBorderColor={"brand.dark"}
        ></Textarea>
      </Flex>
      <Flex direction={"column"} ml={"6"}>
        <Flex mt={"10"} alignItems={"center"}>
          <Text mr={"2"} fontSize={"sm"} as={"b"}>
            Send:
          </Text>
          <Select size={"sm"} focusBorderColor="brand.dark">
            <option value="option1">Email</option>
            <option value="option2">SMS</option>
            <option value="option3">Email and SMS</option>
            <option value="option4">Whatsapp</option>
          </Select>
        </Flex>
        <Flex mt={"4"} alignItems={"center"}>
          <Text mr={"2"} fontSize={"sm"} as={"b"}>
            To:
          </Text>
          <Select size={"sm"} focusBorderColor="brand.dark">
            <option value="option1">Everyone</option>
            <option value="option2">Core Team</option>
            <option value="option3">Owner Team</option>
            <option value="option4">Subcontractos</option>
            <option value="option4">Specific Person</option>
          </Select>
        </Flex>
        <Button mt={"4"} bg={"brand.dark"} color={"white"}>
          Send
        </Button>
      </Flex>
    </Flex>
  );
}

export default CommunicationDisplay;
