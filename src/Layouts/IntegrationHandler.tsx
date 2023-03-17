import React, { useState, useEffect } from "react";
import { Button, Text, Flex } from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";
import { Link } from "@chakra-ui/react";
import supabase from "@/utils/supabaseClient";
import { Session } from "@supabase/supabase-js";

const IntegrationHandler = ({ sessionToken }: { sessionToken: Session }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [integration, setIntegrationStatus] = useState<any>(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: githubIntegrationStatus, error } = await supabase
          .from("githubIntegrationStatus")
          .select("*")
          .eq("user_id", sessionToken.user.id);
        if (error) throw error;
        if (githubIntegrationStatus[0]?.user_id) {
          setIntegrationStatus(githubIntegrationStatus[0]?.user_id);
        }
      } catch (error) {
        setError("there was an error");
      }
      setLoading(false);
    };
    loadData();
  }, [sessionToken]);

  return (
    <Flex direction="column" justifyContent="end" height="100vh">
      {!integration && (
        <Button colorScheme="blackAlpha">
          <FaGithub />
          <Link
            ml="2"
            href="https://github.com/apps/custom3dwebapp/installations/new/"
            target={"_blank"}
          >
            Integrate Github{" "}
          </Link>
        </Button>
      )}
      {integration && (
        <Flex
          justify="center"
          p="2"
          align="center"
          bg={"green.500"}
          borderRadius="md"
        >
          <Text color="white" fontWeight="bold">
            Github Integration Complete
          </Text>
        </Flex>
      )}
    </Flex>
  );
};

export default IntegrationHandler;
