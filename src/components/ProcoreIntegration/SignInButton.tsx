import { useStore } from "@/utils/store";
import { useToast } from "@chakra-ui/react";
import { Button, Flex } from "@chakra-ui/react";

const IntegrateProcore = () => {
  const { session, activeProject } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
  }));

  const toast = useToast();

  const handleLogin = () => {
    if (!session || !activeProject) {
      toast({
        title: "Error",
        description: "Either session or project is not valid !",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return Promise.reject("Either session or project is not valid !");
    }

    const clientId = process.env.NEXT_PUBLIC_PROCORE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_PROCORE_REDIRECT_URI}`;
    const state = activeProject.project_id;
    const baseUri = process.env.NEXT_PUBLIC_PROCORE_BASE_URI;
    const authUrl = `${baseUri}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&state=${state}`;
    window.open(authUrl, "_blank");
  };
  return (
    <Flex flexDirection={"column"} gap="4">
      <Flex>
        <Button color="inherit" onClick={handleLogin} colorScheme={"yellow"}>
          Integrate with Procore
        </Button>
      </Flex>
    </Flex>
  );
};

export default IntegrateProcore;
