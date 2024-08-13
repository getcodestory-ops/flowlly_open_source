import React, { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";

import { useRouter } from "next/router";
import supabase from "@/utils/supabaseClient";
// import checkAdminRights from "@/utils/checkAdminRights";
// import { Session } from "@supabase/supabase-js";
import { useStore } from "@/utils/store";
import { AuthBackground } from "@/components/AuthBackground/AuthBackground";
import { ChangePasswordComponent } from "@/components/ChangePasswordModal/ChangePasswordModal";

function ResetPassword() {
  // const [sessionToken, setSessionToken] = useState<Session | null>();
  // const [hasAdminRights, setAdminRights] = useState<boolean>(false);
  const toast = useToast();
  const router = useRouter();
  const setAppView = useStore((state) => state.setAppView);

  useEffect(() => {
    async function loginCheck() {
      const { token_hash } = router.query;

      if (!token_hash) {
        router.replace("/");
      }
      if (typeof token_hash === "string") {
        const { data: userSession, error } = await supabase.auth.verifyOtp({
          type: "email",
          token_hash,
        });

        const { user, session } = userSession;

        if (session) {
          const { access_token, refresh_token } = session;
          await supabase.auth.setSession({ access_token, refresh_token });
          // setSessionToken(session);
        }
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            status: "error",
            duration: 9000,
            isClosable: true,
          });
          router.replace("/");
        }
      }

      const { data } = await supabase.auth.getSession();

      if (!data?.session?.user) {
        router.replace("/");
      }
      // else {
      // setSessionToken(data?.session);
      // }
    }
    // loginCheck();
    const { token_hash } = router.query;
    if (token_hash) {
      loginCheck();
    }
  }, [router]);

  // useEffect(() => {
  //   async function getAdminRights() {
  //     if (!sessionToken?.user.id) return;
  //     // const adminRights = await checkAdminRights(sessionToken?.user.id);
  //     // setAdminRights(adminRights);
  //   }
  //   getAdminRights();
  // }, [sessionToken?.user]);

  return (
    <AuthBackground>
      <div className="flex items-center justify-center h-screen ">
        <ChangePasswordComponent
          isOpen={true}
          onCancel={() => {
            // router.push("/");
          }}
          toast={toast}
          onError={() => {
            setAppView("updates");
          }}
          onAuthPage={true}
        />
      </div>
    </AuthBackground>
  );
}

export default function AcceptInvite() {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  return <ResetPassword />;
}
