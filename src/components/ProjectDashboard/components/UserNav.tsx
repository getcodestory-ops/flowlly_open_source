"use client";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangePasswordModal } from "@/components/ChangePasswordModal/ChangePasswordModal";
import { UserProfileModal } from "@/components/UserProfileModal/UserProfileModal";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function UserNav({ email }: { email: string }) {
  const [isChangePasswordOpen, setIsChangePasswordOpen] =
    useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const router = useRouter();

  const onLogout = async () => {
    await supabase.auth.signOut();
    router.push("/applogin");
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className=" h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {/* <AvatarImage src="/avatars/01.png" alt="@shadcn" />
               */}

              <AvatarFallback>
                <div className="text-lg">{email && email[0].toUpperCase()}</div>
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {email ? email.split("@")[0] : ""}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
              Profile
              {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
            </DropdownMenuItem>
            {/* <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem> */}
            <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)}>
              Change Password 6565
              {/* <DropdownMenuShortcut>⌘C</DropdownMenuShortcut> */}
            </DropdownMenuItem>
            {/* <DropdownMenuItem>New Team</DropdownMenuItem> */}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout}>
            {/* <form action={onLogout}>
              <button className=" rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
                Logout
              </button>
            </form> */}
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ChangePasswordModal
        onCancel={() => setIsChangePasswordOpen(false)}
        isOpen={isChangePasswordOpen}
      />
      <UserProfileModal
        onCancel={() => setIsProfileOpen(false)}
        isOpen={isProfileOpen}
        email={email}
      />
    </>
  );
}
