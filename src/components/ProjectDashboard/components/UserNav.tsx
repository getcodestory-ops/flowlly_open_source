// import { createClient } from "@/utils/supabase/server";
// import { redirect } from "next/navigation";
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
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@supabase/supabase-js";
import { ChangePasswordModal } from "@/components/ChangePasswordModal/ChangePasswordModal";

export function UserNav({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className=" h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {/* <AvatarImage src="/avatars/01.png" alt="@shadcn" />
               */}

              <AvatarFallback>
                <div className="text-lg">
                  {user.email && user.email[0].toUpperCase()}
                </div>
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.email ? user.email.split("@")[0] : ""}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {/* <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem> */}
            {/* <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem> */}
            <DropdownMenuItem>
              <div onClick={() => setIsOpen(true)}>Change Password</div>
              {/* <DropdownMenuShortcut>⌘C</DropdownMenuShortcut> */}
            </DropdownMenuItem>
            {/* <DropdownMenuItem>New Team</DropdownMenuItem> */}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <form action={onLogout}>
              <button className=" rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
                Logout
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ChangePasswordModal
        onCancel={() => setIsOpen(false)}
        isOpen={isOpen}
        folderName="Change Password"
        onAdd={() => {}}
      />
    </>
  );
}
