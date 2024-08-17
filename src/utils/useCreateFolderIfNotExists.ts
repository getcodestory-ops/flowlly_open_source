import { useEffect } from "react";
import supabase from "./supabaseClient";
import { Session } from "@supabase/supabase-js";

interface SessionToken {
  sessionToken: Session;
}

const createFolderIfNotExists = async (FOLDER_NAME: string) => {
  const { data: folders, error } = await supabase.storage
    .from(`users`)
    .list(FOLDER_NAME);
  if (error) {
    console.error("Error fetching folders: ", error);
    return;
  }
  const folderExists = folders?.some((folder) => folder.name === FOLDER_NAME);

  if (!folderExists) {
    const { error: createError } = await supabase.storage.createBucket(
      FOLDER_NAME,
      { public: false }
    );

    if (createError) {
      console.error("Error creating folder: ", createError);
    }
  }
};

const useCreateFolderIfNotExists = ({ sessionToken }: SessionToken) => {
  useEffect(() => {
    if (!sessionToken?.user) return;
    createFolderIfNotExists(sessionToken.user.id);
  }, [sessionToken]);
};

export default useCreateFolderIfNotExists;
