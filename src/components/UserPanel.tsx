import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Flex,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
} from "@chakra-ui/react";
import supabase from "../utils/supabaseClient";
import { useStore } from "@/utils/store";

const UserPanel = () => {
  const [user, setUser] = useState<any>(null);
  const { setAppView } = useStore((state) => ({
    setAppView: state.setAppView,
  }));
  const router = useRouter();
  // const session = useStore(state=>state.session)

  useEffect(() => {
    async function getAndSetUser() {
      const session = await supabase.auth.getSession();

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
    setAppView("login");
  };

  return (
    <Flex display="flex" alignItems="center">
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
              <Avatar
                name={user.email}
                bg={"brand.accent"}
                color="#14213D"
                w={"30px"}
                h={"30px"}
              />
            </MenuButton>
          </Tooltip>
          <MenuList zIndex="50">
            <MenuItem>{user.email}</MenuItem>
            <MenuItem
              onClick={() => {
                // setAppView("changePassword");

                router.push("/auth/passwordChange");
              }}
            >
              Change Password
            </MenuItem>
            {/* <MenuItem onClick={() => setIsChatbotInstructionsOpen(true)}>
              Show Instructions
            </MenuItem> */}
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </MenuList>
        </Menu>
      )}
    </Flex>
  );
};

export default UserPanel;
