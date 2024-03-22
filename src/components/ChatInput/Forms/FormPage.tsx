import React from "react";
import supabase from "@/utils/supabaseClient";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useStore } from "@/utils/store";
import { Box, Flex, Grid, GridItem } from "@chakra-ui/react";
import UpdateTaskForm from "./UpdateTaskForm";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAiActionForm } from "./useAiActionForm";
import { AgentChat } from "@/types/agentChats";

function FormPage({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { actionType, id } = router.query;
  const { setAppView, appView, setSession } = useStore((state) => ({
    setAppView: state.setAppView,
    appView: state.appView,
    setSession: state.setSession,
  }));

  const chatData = useAiActionForm(id);

  useEffect(() => {
    async function loginCheck() {
      const { data } = await supabase.auth.getSession();
      if (!data?.session?.user) {
        setAppView("login");
      } else {
        setSession(data?.session);
        setAppView("updates");
      }
    }
    loginCheck();
  }, []);

  useEffect(() => {
    console.log(actionType, id);
  }, [actionType, id]);

  return (
    <div>
      {appView === "login" && <Flex>{children}</Flex>}
      {appView !== "login" && (
        <Flex>
          {chatData &&
            chatData.message.role.toLocaleLowerCase() == "scheduler" && (
              <UpdateTaskForm collapse={true} data={chatData} />
            )}
        </Flex>
      )}
    </div>
  );
}

export default FormPage;
