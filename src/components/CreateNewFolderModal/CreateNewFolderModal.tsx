import { useState, useRef, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { timezones } from "@/utils/timezones";
import { createProject } from "@/api/projectRoutes";
import { useStore } from "@/utils/store";

export const AddNewFolderModal = ({
  children,
  parentFolderName,
  onAdd,
}: {
  children?: React.ReactNode;
  parentFolderName: string;
  onAdd: (name: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {children ? children : <Button variant="default">+ Add Folder</Button>}
      </AlertDialogTrigger>
      <AddNewFolderModalContent
        setIsOpen={setIsOpen}
        parentFolderName={parentFolderName}
        onAdd={onAdd}
        isOpen={isOpen}
      />
    </AlertDialog>
  );
};

export const AddNewFolderModalContent = ({
  setIsOpen,
  parentFolderName,
  onAdd,
  isOpen,
}: {
  setIsOpen: (value: boolean) => void;
  parentFolderName: string;
  onAdd: (name: string) => void;
  isOpen: boolean;
}) => {
  const { session } = useStore((state) => ({
    session: state.session,
  }));
  const inputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  //   const mutation = useMutation({
  //     mutationFn: ({
  //       projectName,
  //       projectDescription,
  //       projectNumber,
  //       address,
  //       timezone,
  //     }: {
  //       projectName: string;
  //       projectDescription?: string;
  //       projectNumber?: string;
  //       address?: string;
  //       timezone?: string;
  //     }) =>
  //       createProject(session!, {
  //         name: projectName,
  //         description: projectDescription,
  //         project_number: projectNumber,
  //         address: address,
  //         metadata: {
  //           timezone,
  //         },
  //       }),
  //     onError: (error) => {
  //       console.log(error);
  //     },
  //     onSuccess: () => {
  //       queryClient.invalidateQueries({ queryKey: ["projectList"] });
  //       queryClient.invalidateQueries({ queryKey: ["initialProjectList"] });
  //     },
  //   });

  const [newFolderName, setNewFolderName] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.length) return;

    onAdd(newFolderName);
    setIsOpen(false);
  };

  useEffect(() => {
    setNewFolderName("");
  }, [isOpen]);

  return (
    <AlertDialogContent className="w-[550px] ">
      <AlertDialogHeader>
        <AlertDialogTitle>Create New Folder</AlertDialogTitle>
        <AlertDialogDescription>
          Add a sub folder in {parentFolderName} category
        </AlertDialogDescription>
      </AlertDialogHeader>

      <form onSubmit={handleSubmit}>
        <div className="grid w-full items-center gap-4 pb-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Name for the folder</Label>
            <Input
              id="name"
              placeholder="Name here"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewFolderName(e.target.value)
              }
              ref={inputRef}
              value={newFolderName}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button type="submit">Create</Button>
        </AlertDialogFooter>
      </form>
    </AlertDialogContent>
  );
};
