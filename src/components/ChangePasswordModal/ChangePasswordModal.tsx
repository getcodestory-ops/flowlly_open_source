"use client";
import { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";

import { useToast } from "@chakra-ui/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";

interface ChangePasswordModalProps {
  onAdd: (name: string) => void;
  onCancel: () => void;
  folderName: string;
  isOpen: boolean;
}

export function ChangePasswordModal({
  onAdd,
  onCancel,
  folderName,
  isOpen,
}: ChangePasswordModalProps) {
  const toast = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setPassword("");
    setConfirmPassword("");
    setPasswordsMatch(false);
    setErrorMessage("");
  }, [isOpen]);

  const handleSetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCancel();
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      toast({
        title: "Error resetting password",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: "Password reset successfully",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  const manageErrorHandling = (pwd1: string, pwd2: string) => {
    if (pwd1 === pwd2) {
      if (pwd1.length < 8) {
        setPasswordsMatch(false);
        setErrorMessage("Password must be at least 8 characters long.");
      } else {
        setErrorMessage("");
        setPasswordsMatch(true);
      }
    } else {
      setPasswordsMatch(false);
      setErrorMessage("Passwords do not match. Please re-enter.");
    }
  };

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    const { name, value } = e.target;

    if (name === "password") {
      setPassword(value);
      manageErrorHandling(value, confirmPassword);
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
      manageErrorHandling(password, value);
    }
  };

  return (
    <Modal show={isOpen} backdrop={true} centered onHide={onCancel}>
      <div
        className={`
      fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
      ${isOpen ? "" : "hidden"}
      `}
      >
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Set new passowrd</CardTitle>
            {/* <CardDescription>
              Add a folder in {folderName} category
            </CardDescription> */}
          </CardHeader>
          <form onSubmit={handleSetPassword}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Password</Label>
                  <Input
                    id="name"
                    onChange={handlePasswordInputChange}
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                  />
                  <div className="mt-6"></div>
                  <Label htmlFor="name">Confirm Password</Label>
                  <Input
                    id="name"
                    onChange={handlePasswordInputChange}
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    required
                  />
                  <div
                    className={
                      passwordsMatch ? "hidden" : "text-red-500 text-sm"
                    }
                  >
                    {errorMessage}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                variant={`${passwordsMatch ? "default" : "link"}`}
                type="submit"
                className={!passwordsMatch ? "hidden" : ""}
              >
                Set Password
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Modal>
  );
}

export const ChangePasswordButtonClick = ({
  onClick,
}: {
  onClick: () => void;
}) => {
  return (
    <div>
      <div onClick={onClick}>ChangePassword popup</div>

    </div>
  );
};
