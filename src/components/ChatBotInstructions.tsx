import React from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  Icon,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { FaFolder, FaComment, FaExpandAlt, FaInfoCircle } from "react-icons/fa";
import { SlClose } from "react-icons/sl";

interface Props {
  setIsChatbotInstructionsOpen: (isOpen: boolean) => void;
}

const ChatbotInstructions: React.FC<Props> = ({
  setIsChatbotInstructionsOpen,
}: Props) => {
  return (
    <Box>
      <Flex
        maxW="full"
        width="full"
        top="0"
        position="absolute"
        px="8"
        py="2"
        justifyContent="center"
        bg="brand.dark"
        zIndex={100}
        overflowY={"auto"}
        pt={{ base: "4", md: "4" }}
        left={{ base: "0", md: "0" }}
        flexDirection="column"
      >
        <Flex textColor={"brand.accent"} pt={{ base: "2", md: "8" }}>
          <SlClose
            fontSize={42}
            onClick={() => setIsChatbotInstructionsOpen(false)}
          />
        </Flex>
        <Box width={{ base: "s", md: "2xl" }}>
          <Flex
            color="brand.light"
            fontWeight="bold"
            bg="brand.mid"
            p="4"
            rounded="md"
            mt="10"
            alignItems="center"
          >
            This Demo project has been configured with specification sections
            from BART extension project in San Francisco. You can quickly search
            through all the specifications and find relevant information within
            seconds using the text box below,
          </Flex>
          <Grid
            templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
            gap={4}
            mt="4"
            mb="16"
          >
            <GridItem p="2" bg="brand.mid">
              <Flex alignItems="center" gap={2} direction={"column"}>
                <Icon as={FaComment} boxSize="6" color="brand.accent" />
                <Text color="brand.light">
                  Type your questions in the text box given below to get the
                  answers.
                  <br />
                  <br />
                  Get answers to all of your questions,
                  <br />
                  1. What are the requirements for water test in tunnel liner ?
                  <br />
                  2. What are the qualifications for the surveyors?
                  <br />
                  3. What kind of monitoring is required on the project?
                  <br />
                  4. How to maintain observation wells?
                </Text>
              </Flex>
            </GridItem>
            <GridItem p="2" bg="brand.mid">
              <Flex alignItems="center" gap={2} direction={"column"}>
                <Icon as={FaFolder} boxSize="6" color="brand.accent" />
                <Text color="brand.light">
                  You can upload all of your specifications, drawings,
                  calculation sheets etc. and get answers from these documents.
                  <br />
                  <br />
                  To upload the documents sign up for the app and look for
                  folder icon on top left side and then expand the folder and
                  select your files.
                  <br />
                  <br />
                  We are integrating with procore and your favorite cloud
                  provider for faster and swift experience.
                </Text>
              </Flex>
            </GridItem>
            <GridItem p="2" bg="brand.mid" mb={{ md: "8" }}>
              <Flex alignItems="center" gap={2} direction={"column"}>
                <Icon as={FaExpandAlt} boxSize="6" color="brand.accent" />
                <Text color="brand.light">
                  You can load exact file where the answers to your questions
                  are hidden by simply clicking the source materials.
                </Text>
              </Flex>
            </GridItem>
            <GridItem p="2" bg="brand.mid" mb="8">
              <Flex alignItems="center" gap={2} direction={"column"}>
                <Icon as={FaInfoCircle} boxSize="6" color="brand.accent" />
                <Text color="brand.light">
                  Click on a source to get additional information and context
                  for the chatbot&apos;s response.
                </Text>
              </Flex>
            </GridItem>
          </Grid>
        </Box>
      </Flex>
    </Box>
  );
};

export default ChatbotInstructions;

//                 </Text>
//               </Flex>
//             </GridItem>
//           </Grid>
//         </Box>
//       </Flex>
//     </Box>
//   );
// };

// export default ChatbotInstructions;
