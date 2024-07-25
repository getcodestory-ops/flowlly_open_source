import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  Box,
  Tag,
  TagCloseButton,
  TagLabel,
  useToast,
} from "@chakra-ui/react";
import { IoMdSend } from "react-icons/io";
import { distributeEmails } from "@/api/agentRoutes";
import { Session } from "@supabase/supabase-js";

const EmailModal = ({
  content,
  sessionToken,
  editor,
  subject = "Minutes of the Meeting",
}: {
  content?: string;
  sessionToken?: Session;
  editor?: any;
  subject?: string;
}) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");

  const handleAddEmail = () => {
    if (emailInput && !emails.includes(emailInput)) {
      setEmails([...emails, emailInput]);
      setEmailInput("");
    }
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleDistributeEmails = () => {
    console.log("Distributing emailsa", emails, sessionToken);
    if (!sessionToken || emails.length === 0) return;
    console.log("Distributing emails", emails);
    if (content) distributeEmails(sessionToken, content, emails, subject);
    else if (editor)
      distributeEmails(sessionToken, editor.getHTML(), emails, subject);
    else {
      toast({
        title: "Error",
        description: "No content found to send",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    }
    toast({
      title: "Emails sent",
      description: "The minutes of the meeting have been sent to the emails",
      status: "success",
      duration: 9000,
      isClosable: true,
    });
    onClose();
  };

  return (
    <>
      <Button
        leftIcon={<IoMdSend />}
        onClick={onOpen}
        colorScheme="green"
        size="sm"
        m="2"
        p="2"
      >
        Distribute {subject}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size={"xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add User Emails</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter email"
              />
              <Button mt={4} onClick={handleAddEmail}>
                Add Email
              </Button>
            </FormControl>
            <Box mt={4}>
              {emails.map((email) => (
                <Tag
                  key={email}
                  size="md"
                  borderRadius="full"
                  variant="solid"
                  colorScheme="blue"
                  mr={2}
                  mt={2}
                >
                  <TagLabel>{email}</TagLabel>
                  <TagCloseButton onClick={() => handleRemoveEmail(email)} />
                </Tag>
              ))}
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="yellow"
              mr={3}
              isDisabled={emails.length === 0}
              onClick={handleDistributeEmails}
            >
              Distribute Emails
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EmailModal;
