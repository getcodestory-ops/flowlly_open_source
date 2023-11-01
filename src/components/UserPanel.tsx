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
  Tooltip,
} from "@chakra-ui/react";
import supabase from "../utils/supabaseClient";
import { useStore } from "@/utils/store";

const UserPanel = () => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  // const session = useStore(state=>state.session)

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
          <Tooltip
            label="User Info"
            aria-label="A tooltip"
            bg="white"
            color="brand.dark"
          >
            <MenuButton
              bg="none"
              color="teal.500"
              display="flex"
              justifyContent="center"
              cursor={"pointer"}
            >
              <Avatar name={user.email} bg={"brand.dark"} color="white" />
            </MenuButton>
          </Tooltip>
          <MenuList zIndex="50">
            <MenuItem>{user.email}</MenuItem>
            <MenuItem onClick={() => router.push("/auth/passwordChange")}>
              Change Password
            </MenuItem>
            {/* <MenuItem onClick={() => setIsChatbotInstructionsOpen(true)}>
              Show Instructions
            </MenuItem> */}
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </MenuList>
        </Menu>
      )}
    </Box>
  );
};

export default UserPanel;
