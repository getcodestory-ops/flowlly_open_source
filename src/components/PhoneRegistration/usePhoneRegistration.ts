import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import {
  addPhoneChats,
  removePhoneRegister,
  removeDirectoryEntry,
} from "@/api/registrationRoutes";
import {
  getMembers,
  createNewMemberEntry,
  updateMemberEntity,
} from "@/api/membersRoutes";
import { useToast } from "@/components/ui/use-toast";
import { MemberEntity } from "@/types/members";

export const usePhoneRegistration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newMember, setNewMember] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
    enable_sms: false,
    language: "",
  });
  const [editMember, setEditMember] = useState<MemberEntity | null>(null);
  const [Members, setMembers] = useState<any>([]);
  const [addingMember, setAddingMember] = useState(false);

  const handleInputChange = (e: any, field: any, modalOpen?: () => void) => {
    if (field === "enable_sms") {
      // // let consent = confirm("Review the sms policy  and click ok to continue");
      // if (!consent) return;

      setNewMember({ ...newMember, [field]: e.target.checked });
      return;
    }
    // console.log("field", field, e.target.value);
    if (field === "phone") {
      setNewMember({ ...newMember, [field]: e });
      return;
    }

    setNewMember({ ...newMember, [field]: e.target.value });
  };

  const handleMemberEdit = (e: any, field: string, modalOpen?: () => void) => {
    if (!editMember) {
      return;
    }
    if (field === "enable_sms") {
      if (modalOpen) {
        modalOpen();
      }
      // let consent = confirm("review the sms policy and click ok to continue");
      // if (!consent) return;

      setEditMember({ ...editMember, [field]: e.target.checked });
      console.log(editMember);
      return;
    }
    if (field === "phone") {
      setEditMember({ ...editMember, [field]: e });
      return;
    }

    setEditMember({ ...editMember, [field]: e.target.value });
  };

  const { session, activeProject, activeChatEntity, selectedContext } =
    useStore((state) => ({
      session: state.session,
      activeProject: state.activeProject,
      activeChatEntity: state.activeChatEntity,
      selectedContext: state.selectedContext,
    }));

  const mutation = useMutation({
    mutationFn: (phoneNumber: string) => {
      if (!session || !activeProject) {
        toast({
          title: "Error",
          description: "No session or active project",
          variant: "destructive",
        });
        return Promise.reject("No session or active project");
      }
      return addPhoneChats(session, activeProject.project_id, {
        phone_number: phoneNumber,
        brain_id: selectedContext?.id,
      });
    },
    onError: (error: Error & { response?: any }) => {
      toast({
        title: "Error",
        description: error.response?.data.detail ?? "Something went wrong",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Phone Number successfully registered !",
      });
      queryClient.invalidateQueries({ queryKey: ["memberList"] });
    },
  });

  const updateMember = useMutation({
    mutationFn: (memberDetails: MemberEntity) => {
      if (!session || !activeProject) {
        toast({
          title: "Error",
          description: "No session or active project",
          variant: "destructive",
        });
        return Promise.reject("No session or active project");
      }
      return updateMemberEntity(
        session,
        activeProject.project_id,
        memberDetails
      );
    },
    onError: (error: Error & { response?: any }) => {
      toast({
        title: "Error",
        description: error.response?.data.detail ?? "Something went wrong",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Phone Number successfully registered !",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["memberList"] });
    },
  });

  const deRegister = useMutation({
    mutationFn: (phoneNumber: string) => {
      if (!session || !activeProject) {
        toast({
          title: "Error",
          description: "No session or active project",
          variant: "destructive",
        });
        return Promise.reject("No session or active project");
      }
      return removePhoneRegister(
        session,
        activeProject.project_id,
        phoneNumber
      );
    },
    onError: (error: Error & { response?: any }) => {
      toast({
        title: "Error",
        description: error.response?.data.detail ?? "Something went wrong",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Phone Number successfully removed !",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["memberList"] });
    },
  });

  const deleteDirectoryEntry = useMutation({
    mutationFn: (email: string) => {
      if (!session || !activeProject) {
        toast({
          title: "Error",
          description: "No session or active project",
          variant: "destructive",
        });
        return Promise.reject("No session or active project");
      }
      return removeDirectoryEntry(session, activeProject.project_id, email);
    },
    onError: (error: Error & { response?: any }) => {
      toast({
        title: "Error",
        description: error.response?.data.detail ?? "Something went wrong",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Member successfully removed !",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["memberList"] });
    },
  });

  const registerPhoneNumber = (checked: boolean, phone_number?: string) => {
    if (!phone_number) {
      toast({
        title: "Error",
        description: "Phone number is required",
        variant: "destructive",
      });
      return;
    }

    if (checked) {
      mutation.mutate(phone_number);
      return;
    }
    deRegister.mutate(phone_number);
  };

  const deleteMember = (email: string) => {
    deleteDirectoryEntry.mutate(email);
  };

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["memberList", session, activeProject],
    queryFn: async () => {
      if (!session || !activeProject) {
        return Promise.reject("No session or active project");
      }

      return getMembers(session, activeProject.project_id);
    },
    enabled: !!session?.access_token,
  });

  const handleSaveMember = async () => {
    try {
      if (!session || !activeProject) {
        return Promise.reject("No session or active project");
      }

      const memberDetails = {
        ...newMember, // This includes first_name, last_name, email, phone, role
        project_id: activeProject?.project_id, // Assuming activeProject contains project_id
        // user_id: "", // Set the user_id if available or required
        responsibilities: "", // Set default or get from form
        skills: "", // Set default or get from form
        active: true, // Set default active status
      };

      // Call the API to create the new member entry
      const savedMember = await createNewMemberEntry(
        session,
        activeProject?.project_id,
        memberDetails
      );

      // Reset new member state and hide the add member row
      setNewMember({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "",
        enable_sms: false,
        language: "English",
      });
      setAddingMember(false);
      queryClient.invalidateQueries({ queryKey: ["memberList"] });
    } catch (error) {
      // Handle error (e.g., display an error message)
      console.error("Error saving member:", error);
    }
  };

  const updatememberDetails = async () => {
    try {
      if (!session || !activeProject) {
        return Promise.reject("No session or active project");
      }

      if (!editMember) {
        return Promise.reject("No active member to update");
      }
      const memberDetails = {
        ...editMember,
        project_id: activeProject?.project_id,
        responsibilities: "",
        skills: "",

        active: true,
      };

      updateMember.mutate(memberDetails);

      setEditMember(null);

      queryClient.invalidateQueries({ queryKey: ["memberList"] });
    } catch (error) {
      // Handle error (e.g., display an error message)
      console.error("Error saving member:", error);
    }
  };

  return {
    registerPhoneNumber,
    deleteMember,
    members,
    handleSaveMember,
    handleInputChange,
    handleMemberEdit,
    addingMember,
    setAddingMember,
    editMember,
    newMember,
    setEditMember,
    updatememberDetails,
  };
};
