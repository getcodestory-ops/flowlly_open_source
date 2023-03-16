import { useState, useEffect } from "react";
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

const UserPanel = () => {
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
            color="blackAlpha.300"
            display="flex"
            justifyContent="center"
            cursor={"pointer"}
          >
            <Avatar name={user.email} bg={"blackAlpha.300"} />
          </MenuButton>
          <MenuList>
            <MenuItem>{user.email}</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </MenuList>
        </Menu>
      )}
    </Box>
  );
};

export default UserPanel;
