import { useEffect, useState } from "react";
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
import { supabase } from "@/utils/supabase/client";

interface ChangePasswordModalProps {
  onCancel: () => void;
  isOpen: boolean;

  onError?: () => void;
  onSuccess?: () => void;
}

export function ChangePasswordModal({
  onCancel,
  isOpen,
}: ChangePasswordModalProps) {
  const toast = useToast();
  return (
    <Modal show={isOpen} backdrop={true} centered onHide={onCancel}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <ChangePasswordComponent
          onCancel={onCancel}
          isOpen={isOpen}
          toast={toast}
        />
      </div>
    </Modal>
  );
}

export const ChangePasswordComponent = ({
  onCancel,
  isOpen,
  toast,
  onError,
  onSuccess,
  onAuthPage = false,
}: ChangePasswordModalProps & {
  toast: ReturnType<typeof useToast>;
  onAuthPage?: boolean;
}) => {
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
    if (!passwordsMatch) return;

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
      onError && onError();
      return;
    }

    toast({
      title: "Password reset successfully",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    onSuccess && onSuccess();
    onCancel();
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

  useEffect(() => {
    manageErrorHandling(password, confirmPassword);
  }, [password, confirmPassword]);
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Set new passowrd</CardTitle>
      </CardHeader>
      <form onSubmit={handleSetPassword} autoComplete="off">
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Password</Label>
              <Input
                id="#1pswd"
                name="#1pswd"
                onChange={(e) => {
                  e.preventDefault();
                  setPassword(e.target.value);
                }}
                type="password"
                placeholder="********"
                value={password}
              />
              <div className="mt-6"></div>
              <Label htmlFor="name">Confirm Password</Label>
              <Input
                id="#2pswd"
                name="#2pswd"
                onChange={(e) => {
                  e.preventDefault();
                  setConfirmPassword(e.target.value);
                }}
                type="password"
                placeholder="********"
                value={confirmPassword}
              />
              <div
                className={passwordsMatch ? "hidden" : "text-red-500 text-sm"}
              >
                {errorMessage}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {!onAuthPage && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            variant={`${passwordsMatch ? "default" : "link"}`}
            type="submit"
            disabled={!passwordsMatch}
          >
            Set Password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
