import { useState, useEffect, useCallback, useRef } from "react";
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
  Heading,
  Progress,
} from "@chakra-ui/react";
import { FaUpload, FaFolder, FaPlus, FaCheck } from "react-icons/fa";
import supabase from "../utils/supabaseClient";
import AddFolderMenu from "@/components/AddFolderMenu";
import { useStore } from "@/utils/store";

interface SessionToken {
  folderList: { name: string }[] | null;
  setFolderList: React.Dispatch<
    React.SetStateAction<{ name: string }[] | null>
  >;
}

interface FileUploadStatus {
  id: number;
  file_name: string;
  status?: boolean | null;
  folder_name?: string;
  total_size?: number;
  uploaded_size?: number;
  unique_id?: string;
}

function FileHandler({ folderList, setFolderList }: SessionToken) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [pdfList, setPdfList] = useState<
    { name: string; fileList: string[] | undefined }[] | null
  >(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isFolderSubMenuOpen, setIsFolderSubMenuOpen] =
    useState<boolean>(false);
  const [refreshToken, setrefreshToken] = useState(true);
  const [listFileStatus, setListFileStatus] = useState<FileUploadStatus[]>([]);
  const { sessionToken, hasAdminRights } = useStore((state) => ({
    sessionToken: state.session,
    hasAdminRights: state.hasAdminRights,
  }));

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
      .select(
        "id, file_name, status, folder_name, uploaded_size, total_size, unique_id"
      )
      .eq("user_id", userId);

    if (error) {
      console.log(error);
    } else {
      setListFileStatus(fileStatus);
    }
  }, [userId]);

  useEffect(() => {
    const fetchFolderLists = async () => {
      const fileList = await fetchFolderContents("");
      fetchFileProcessStatus();
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
    const realtime = supabase
      .channel("any")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "uploadfileTrack" },
        (payload: { new: FileUploadStatus }) => {
          const index = listFileStatus.findIndex(
            (item) => item.unique_id === payload.new.unique_id
          );
          if (index !== -1) {
            // Update the existing record
            const newListFileStatus = [...listFileStatus];
            newListFileStatus[index] = payload.new;

            // Update the state with the new array
            setListFileStatus(newListFileStatus);
          } else {
            setListFileStatus((state) => [...state, payload.new]);
          }
          // }
        }
      )
      .subscribe();

    return () => {
      realtime.unsubscribe();
    };
  }, [listFileStatus]);

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
        .from(`users/${userId}/${folderName}`)
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
      toast({
        title: "Select a file again",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
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

      fetch(
        `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/file_process?folderName=${folderName}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken?.access_token}`,
          },
          body: formData,
        }
      )
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
            title: "File processing added in backend! ",
            status: "loading",
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
              title:
                "File uploaded successfully but data is being processed, check after few mins",
              status: "success",
              duration: 3000,
              isClosable: true,
              position: "top-right",
            });
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
    }
  };

  //ui
  return (
    <Flex direction={"column"} p="4" background="brand.mid" height="100vh">
      <>
        <Box marginBottom="4">
          <Heading as="h2" size="md" color="white">
            Explorer
          </Heading>
        </Box>
        {hasAdminRights && (
          <Stack direction="row" justify="space-between" mb={2}>
            <Stack justify="start" width="full">
              <Button
                colorScheme="teal"
                bg="purple"
                size={"sm"}
                onClick={() => setIsFolderSubMenuOpen(true)}
                _hover={{ bg: "purple.600" }}
              >
                <FaPlus />

                <Text ml="2" fontSize={"base"}>
                  Add New Folder
                </Text>
              </Button>
            </Stack>
            <AddFolderMenu
              isOpen={isFolderSubMenuOpen}
              onClose={() => setIsFolderSubMenuOpen(false)}
              onCreateFolder={handleCreateFolder}
            />
          </Stack>
        )}
      </>
      <>
        <Accordion
          allowToggle
          width="100%"
          overflowY="auto"
          mt="2"
          color="white"
          sx={{
            "&::-webkit-scrollbar": {
              width: "8px",
              borderRadius: "8px",
              backgroundColor: `rgba(0, 0, 0, 0.05)`,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: `rgba(0, 0, 0, 0.05)`,
            },
          }}
        >
          {folderList?.map((folder) => (
            <AccordionItem key={folder.name}>
              <h2>
                <AccordionButton>
                  <Flex flex="1" textAlign="left" align-items="center">
                    <Icon as={FaFolder} mr={4} mt={1} color="white" />
                    {folder.name}
                  </Flex>{" "}
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={1} color="white">
                {pdfList
                  ?.filter((folderNames) => folderNames.name === folder.name)[0]
                  ?.fileList?.map((files) => {
                    const uploadedFile = listFileStatus.find(
                      (f) =>
                        f.file_name === files && f.folder_name === folder.name
                    );

                    return (
                      <Box key={files} display="flex" pl="8" py="1">
                        <Text fontSize="xs" overflowX="auto">
                          {files}
                        </Text>
                        {uploadedFile?.status && (
                          <>
                            {(
                              (uploadedFile?.uploaded_size! * 100) /
                              (uploadedFile?.total_size! ?? 1)
                            ).toFixed(1) === "100.0" ? (
                              <Icon
                                as={FaCheck}
                                ml="2"
                                mt="2"
                                fontSize={"xs"}
                              />
                            ) : (
                              <>
                                <Progress
                                  size="sm"
                                  color={"blue.100"}
                                  value={
                                    (uploadedFile?.uploaded_size! * 100) /
                                    (uploadedFile?.total_size! ?? 1)
                                  }
                                />
                                <Text ml="4" fontSize={"xs"}>
                                  {(
                                    (uploadedFile?.uploaded_size! * 100) /
                                    (uploadedFile?.total_size! ?? 1)
                                  ).toFixed(1)}
                                  %
                                </Text>
                              </>
                            )}
                          </>
                        )}
                      </Box>
                    );
                  })}
                {hasAdminRights && (
                  <Box p="2">
                    <Stack
                      spacing={4}
                      border="1px"
                      p="4"
                      borderRadius={"md"}
                      borderColor="brand.dark"
                    >
                      <Box>
                        <input
                          id="file-upload"
                          type="file"
                          accept="application/pdf"
                          ref={inputRef}
                          onChange={handleFileSelect}
                        />
                      </Box>
                      <Button
                        id="upload_button_id"
                        colorScheme="teal"
                        size="sm"
                        bg="brand.dark"
                        _hover={{ bg: "purple" }}
                        onClick={() => handleFileUpload(folder.name)}
                      >
                        <FaUpload />
                        <Text ml="2">Upload</Text>
                      </Button>
                    </Stack>
                  </Box>
                )}
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </>
    </Flex>
  );
}

export default FileHandler;
