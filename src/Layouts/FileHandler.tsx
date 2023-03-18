import { useState, useEffect, useCallback } from "react";
import {
  Flex,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  Stack,
  Icon,
  Text,
  Button,
  AccordionPanel,
  useToast,
} from "@chakra-ui/react";
import { FaUpload, FaFolder, FaPlus, FaCheck } from "react-icons/fa";
import { Session } from "@supabase/supabase-js";
import supabase from "../utils/supabaseClient";
import AddFolderMenu from "@/components/AddFolderMenu";
// import useCreateFolderIfNotExists from "@/utils/useCreateFolderIfNotExists";

interface SessionToken {
  sessionToken: Session;
  folderList: { name: string }[] | null;
  setFolderList: React.Dispatch<
    React.SetStateAction<{ name: string }[] | null>
  >;
}

function FileHandler({
  sessionToken,
  folderList,
  setFolderList,
}: SessionToken) {
  //states
  const toast = useToast();
  const [pdfList, setPdfList] = useState<
    { name: string; fileList: string[] | undefined }[] | null
  >(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [isFolderSubMenuOpen, setIsFolderSubMenuOpen] =
    useState<boolean>(false);
  const [refreshToken, setrefreshToken] = useState(true);
  const [listFileStatus, setListFileStatus] = useState<{ file_name: string }[]>(
    []
  );

  useEffect(() => {
    setUserId(sessionToken?.user.id);
  }, [sessionToken]);

  // useCreateFolderIfNotExists({ sessionToken });
  //initial state update
  const fetchFolderContents = useCallback(
    async (folderName: string) => {
      if (!userId) return;
      const { data: pdfList, error } = await supabase.storage
        .from(`users`)
        .list(`${userId}/${folderName}`);
      if (error) {
        console.log(error);
        return [];
      } else {
        return (
          pdfList!
            .filter((pdf: any) => pdf.name !== ".emptyFolderPlaceholder")
            ?.map((pdf: any) => pdf.name) || []
        );
      }
    },
    [userId]
  );
  const fetchFileProcessStatus = useCallback(async () => {
    if (!userId) return;
    const { data: fileStatus, error } = await supabase
      .from("uploadfileTrack")
      .select(`file_name`)
      .eq("user_id", userId);
    if (error) {
      console.log(error);
      return [];
    } else {
      setListFileStatus(fileStatus);
    }
  }, [userId]);

  useEffect(() => {
    const fetchFolderLists = async () => {
      const fileList = await fetchFolderContents("");
      fetchFileProcessStatus();
      //console.log(fileList);
      setFolderList(
        fileList?.map((folderName: string) => ({ name: folderName })) || null
      );
    };
    fetchFolderLists();
  }, [
    userId,
    fetchFolderContents,
    refreshToken,
    setFolderList,
    fetchFileProcessStatus,
  ]);

  useEffect(() => {
    if (!folderList) return;
    const fetchFileList = async () => {
      const promises = folderList.map(async (folder) => {
        const fileList = await fetchFolderContents(folder.name);
        return { name: folder.name, fileList: fileList };
      });
      const results = await Promise.all(promises);
      setPdfList(results);
    };
    fetchFileList();
  }, [folderList, fetchFolderContents]);

  //handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setSelectedFile(file || null);
  };

  const handleCreateFolder = (folderName: string) => {
    async function createFolder() {
      console.log("Creating folder:", folderName);
      const emptyFile = new File([], ".emptyFolderPlaceholder", {
        type: "text/plain",
      });
      const { data, error } = await supabase.storage
        .from(`/users/${userId}/${folderName}`)
        .upload(emptyFile.name, emptyFile);
      if (error) {
        console.log(error);
        toast({
          title: "something went wrong while creating folder",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      } else {
        toast({
          title: `folder ${folderName} created !  `,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
        setrefreshToken((state) => !state);
      }
    }
    createFolder();
  };

  const handleFileUpload = async (folderName: string) => {
    if (!selectedFile) {
      console.log("nopes");
    }
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const toastId = toast({
        title: "File processing started !",
        status: "loading",
        duration: null,
        isClosable: true,
        position: "top-right",
      });

      fetch(`api/textfile?folderName=${folderName}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken.access_token}`,
        },
        body: formData,
      })
        .then((response) => {
          toast.close(toastId);
          if (!response.ok) {
            toast({
              title: "Network response was not ok",
              status: "error",
              duration: 3000,
              isClosable: true,
              position: "top-right",
            });
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then(async (data) => {
          toast({
            title: "File data processed !",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });

          //uploading file
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from(`/users/${userId}/${folderName}`)
              .upload(selectedFile.name, selectedFile);
          if (uploadError) {
            console.log(uploadError);
            toast({
              title: "Error uploading file",
              description: uploadError.message,
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "top-right",
            });
          } else {
            setPdfList((prevPdfList) => {
              // Find the item with the matching name and update its fileList
              const updatedItem = prevPdfList?.find(
                (item) => item.name === folderName
              );
              if (
                updatedItem &&
                !updatedItem.fileList?.includes(selectedFile.name)
              ) {
                updatedItem.fileList = [
                  ...(updatedItem.fileList || []),
                  selectedFile.name,
                ];
              }
              // Return the updated pdfList
              return prevPdfList;
            });

            toast({
              title: "File uploaded successfully",
              status: "success",
              duration: 3000,
              isClosable: true,
              position: "top-right",
            });
          }

          //setting the sucess message
          const { data: uploadMessage, error } = await supabase
            .from("uploadfileTrack")
            .insert({
              user_id: sessionToken.user.id,
              file_name: selectedFile.name,
            });

          if (error) {
            console.log(error);
            return error;
          } else {
            console.log("file status updated !");
            return "okay";
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          toast({
            title:
              "There was an error in processing the file please try again!",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        });

      setSelectedFile(null);
    }
  };

  //ui
  return (
    <>
      <Stack direction="row" justify="space-between" mb={4}>
        <Button
          colorScheme="blackAlpha"
          onClick={() => setIsFolderSubMenuOpen(true)}
        >
          <FaPlus />
          <Text ml="2">Add New Group</Text>
        </Button>
        <AddFolderMenu
          isOpen={isFolderSubMenuOpen}
          onClose={() => setIsFolderSubMenuOpen(false)}
          onCreateFolder={handleCreateFolder}
        />
      </Stack>
      <Accordion
        allowToggle
        width="100%"
        overflowY="scroll"
        borderColor={"blackAlpha.300"}
      >
        {folderList?.map((folder) => (
          <AccordionItem key={folder.name}>
            <h2>
              <AccordionButton>
                <Flex flex="1" textAlign="left" align-items="center">
                  <Icon as={FaFolder} mr={4} mt={1} />
                  {folder.name}
                </Flex>
                {/* <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleAddFolder}
                      aria-label="Add folder"
                    >
                      <Icon as={FaPlus} />
                    </Button> */}

                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={1}>
              {pdfList
                ?.filter((folderNames) => folderNames.name === folder.name)[0]
                ?.fileList?.map((files) => {
                  const uploadedFile = listFileStatus.find(
                    (f) => f.file_name === files
                  );

                  return (
                    <Box
                      key={files}
                      display="flex"
                      pl="8"
                      py="1"
                      _hover={{ bg: "blackAlpha.400" }}
                    >
                      <Text>{files}</Text>
                      {uploadedFile && (
                        <Icon as={FaCheck} color="green.500" ml="2" />
                      )}
                    </Box>
                  );
                })}
              <Box p="2">
                <Stack spacing={4}>
                  <Box>
                    <input
                      id="file-upload"
                      type="file"
                      accept=" .txt,.js,.jsx,.ts,.tsx"
                      onChange={handleFileSelect}
                    />
                  </Box>
                  <Button
                    colorScheme="blackAlpha"
                    onClick={() => handleFileUpload(folder.name)}
                  >
                    <FaUpload />
                    <Text ml="2">Upload</Text>
                  </Button>
                </Stack>
              </Box>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}

export default FileHandler;
