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
import { Brain } from "@/utils/store";
import { getBrains } from "@/api/brainRoutes";

interface FileUploadStatus {
  id: number;
  file_name: string;
  status?: boolean | null;
  folder_name?: string;
  total_size?: number;
  uploaded_size?: number;
  unique_id?: string;
}

function FileHandler() {
  const {
    sessionToken,
    hasAdminRights,
    folderList,
    setFolderList,
    setPdfViewer,
    selectedContext,
    setSelectedContext,
  } = useStore((state) => ({
    sessionToken: state.session,
    hasAdminRights: state.hasAdminRights,
    folderList: state.folderList,
    setFolderList: state.setFolderList,
    setPdfViewer: state.setPdfViewer,
    selectedContext: state.selectedContext,
    setSelectedContext: state.setSelectedContext,
  }));

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

  useEffect(() => {
    if (!sessionToken) return;
    setUserId(sessionToken?.user.id);
  }, [sessionToken]);

  //initial state update
  const fetchFolderContents = useCallback(
    async (folderName: string) => {
      if (!userId) return;
      const { data: pdfList, error } = await supabase.storage
        .from(`users`)
        .list(`${folderName}`);
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

  // const fetchFileProcessStatus = useCallback(async () => {
  //   if (!userId) return;

  //   const { data: fileStatus, error } = await supabase
  //     .from("uploadfileTrack")
  //     .select("id, file_name, status, folder_name, uploaded_size, total_size")
  //     .eq("user_id", userId);

  //   if (error) {
  //     console.log(error);
  //   } else {
  //     setListFileStatus(fileStatus);
  //   }
  // }, [userId]);

  useEffect(() => {
    const fetchFolderLists = async () => {
      if (!sessionToken) return;
      const brains = await getBrains(sessionToken);
      setFolderList(brains || null);
    };

    fetchFolderLists();
  }, [sessionToken, setFolderList]);

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
        const fileList = await fetchFolderContents(folder.id!);
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
      if (!sessionToken) return;
      const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/brains/`; // Replace 'YOUR_API_ENDPOINT' with your actual API URL.

      const brainData = {
        name: folderName,
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken.access_token}`, // Replace 'YOUR_BEARER_TOKEN' with your actual token.
          },
          body: JSON.stringify(brainData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setFolderList([...folderList!, data]);
        console.log(data);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    }
    createFolder();
  };

  const handleFileUpload = async (folderName: Brain) => {
    if (!sessionToken) return;
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
        `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/file_upload?brain_id=${folderName.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken.access_token}`,
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

    // if (inputRef.current) {
    //   inputRef.current = null;
    // }
  };

  //ui
  return (
    <Flex
      direction={"column"}
      p="4"
      background="brand.mid"
      height="100vh"
      width="full"
    >
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
                color="white"
                width="full"
                variant="outline"
                borderColor="white"
                _hover={{ bg: "gray.600" }}
                onClick={() => setIsFolderSubMenuOpen(true)}
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
            <AccordionItem
              key={folder.name}
              onClick={() => setSelectedContext(folder)}
              boxShadow={
                folder.id === selectedContext?.id
                  ? "0px 0px 8px 1px white"
                  : "none"
              }
            >
              <h2>
                <AccordionButton>
                  <Flex flex="1" textAlign="left" align-items="center">
                    <Icon as={FaFolder} mr={4} mt={1} color="white" />
                    {folder.name}
                  </Flex>

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
                        <Text
                          fontSize="xs"
                          overflowX="auto"
                          cursor={"pointer"}
                          onClick={() => {
                            setPdfViewer({
                              isPdfVisible: true,
                              pageNumber: 1,
                              filePath: files,
                            });
                            setSelectedContext(folder);
                          }}
                        >
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
                        onClick={() => handleFileUpload(folder)}
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
