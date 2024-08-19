import { useState } from "react";
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

import { Textarea } from "@/components/ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { timezones } from "@/utils/timezones";
import { createProject } from "@/api/projectRoutes";
import { useStore } from "@/utils/store";

const formSchema = z.object({
  projectname: z
    .string()
    .min(4, {
      message: "Project name must be at least 4 characters.",
    })
    .max(64, {
      message: "Project name must be less than 64 characters.",
    }),
  projectdescription: z
    .string()
    .max(100, {
      message: "Description must be less than 100 characters.",
    })
    .optional(),
  projectnumber: z
    .string()
    .max(100, {
      message: "Description must be less than 100 characters.",
    })
    .optional(),
  projectaddress: z.string().optional(),
  timezone: z.string().optional(),
});

export function AddNewProjectButton({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {children ? children : <Button variant="default">+ Add Project</Button>}
      </AlertDialogTrigger>
      <AddNewProjectModalContent setIsOpen={setIsOpen} />
    </AlertDialog>
  );
}

export const AddNewProjectModalContent = ({
  setIsOpen,
}: {
  setIsOpen: (value: boolean) => void;
}) => {
  const { session } = useStore((state) => ({
    session: state.session,
  }));

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      projectName,
      projectDescription,
      projectNumber,
      address,
      timezone,
    }: {
      projectName: string;
      projectDescription?: string;
      projectNumber?: string;
      address?: string;
      timezone?: string;
    }) =>
      createProject(session!, {
        name: projectName,
        description: projectDescription,
        project_number: projectNumber,
        address: address,
        metadata: {
          timezone,
        },
      }),
    onError: (error) => {
      console.log(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectList"] });
      queryClient.invalidateQueries({ queryKey: ["initialProjectList"] });
    },
  });

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectname: "",
      projectdescription: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // console.log(values);

    setIsOpen(false); // Close the dialog after submission
    mutation.mutate({
      projectName: values.projectname,
      projectDescription: values.projectdescription,
      projectNumber: values.projectnumber,
      address: values.projectaddress,
      timezone: values.timezone,
    });
    form.reset(); // Reset the form fields
  }
  return (
    <AlertDialogContent className="w-[550px] ">
      <AlertDialogHeader>
        <AlertDialogTitle>Create New Project</AlertDialogTitle>
        <AlertDialogDescription>
          Deploy your new project in one-click.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-row space-between"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="projectname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Project Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Name for the new project"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription></FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="projectnumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Project number" {...field} />
                    </FormControl>
                    <FormDescription></FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="projectdescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add a description about your project"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="projectaddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Address</FormLabel>
                <FormControl>
                  <Input placeholder="Project address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <FormControl>
                  <Select
                    defaultValue="timezone"
                    value={field.value} // Set the value from the form state
                    onValueChange={(value) => field.onChange(value)} // Update the form state
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select"></SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button type="submit">Create</Button>
          </AlertDialogFooter>
        </form>
      </Form>
    </AlertDialogContent>
  );
};
