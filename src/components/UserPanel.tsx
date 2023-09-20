import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from "@chakra-ui/react";
import supabase from "../utils/supabaseClient";

interface Props {
  setIsChatbotInstructionsOpen: (isOpen: boolean) => void;
}

const UserPanel: React.FC<Props> = ({
  setIsChatbotInstructionsOpen,
}: Props) => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function getAndSetUser() {
      const session = await supabase.auth.getSession();
      //console.log(session.data.session?.user.id);

      setUser(session.data.session?.user ?? null);

      const { data: authSubscription } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user ?? null);
        }
      );
      return authSubscription?.subscription?.unsubscribe();
    }
    getAndSetUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <Box ml="auto" display="flex" alignItems="center">
      {user && (
        <Menu>
          <MenuButton
            bg="none"
            color="teal.500"
            display="flex"
            justifyContent="center"
            cursor={"pointer"}
          >
            <Avatar name={user.email} bg={"brand.mid"} color="brand.accent" />
          </MenuButton>
          <MenuList zIndex="50">
            <MenuItem>{user.email}</MenuItem>
            <MenuItem onClick={() => router.push("/auth/passwordChange")}>
              Change Password
            </MenuItem>
            <MenuItem onClick={() => setIsChatbotInstructionsOpen(true)}>
              Show Instructions
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </MenuList>
        </Menu>
      )}
    </Box>
  );
};

export default UserPanel;
