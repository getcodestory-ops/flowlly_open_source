"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "@/utils/store";
import { useRouter, usePathname } from "next/navigation";
import supabase from "@/utils/supabaseClient";
import { Button } from "@/components/ui/button";
import { AddNewProjectModalContent } from "@/components/Schedule/AddNewProjectModal";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
export default function MainLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [showNewTeamDialog, setShowNewTeamDialog] = useState(false);

  const { setSessionToken } = useStore((state) => ({
    setSessionToken: state.setSession,
  }));

  useEffect(() => {
    async function loginCheck() {
      const { data } = await supabase.auth.getSession();

      if (!data?.session?.user) {
        router.replace("/applogin");
      } else {
        setSessionToken(data?.session);
      }
    }
    loginCheck();
  }, [router, setSessionToken]);

  return (
    <div className="flex items-center justify-center h-screen">
      <AlertDialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
        <AlertDialogTrigger asChild>
          <Button>
            <PlusCircledIcon className="mr-2 h-5 w-5" />
            Create Project
          </Button>
        </AlertDialogTrigger>
        <AddNewProjectModalContent setIsOpen={setShowNewTeamDialog} />
      </AlertDialog>
    </div>
  );
}
