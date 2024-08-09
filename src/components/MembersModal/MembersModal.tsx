import { Modal } from "react-bootstrap";

import { useToast } from "@chakra-ui/react";

import { useStore } from "@/utils/store";
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
import { MemberEntity } from "@/types/members";
import { TeamDetail } from "./TeamDetail";

interface MembersModalProps {
  onCancel: () => void;
  isOpen: boolean;
  projectAccessId?: string;
}

export function MembersModal({
  onCancel,
  isOpen,
  projectAccessId,
}: MembersModalProps) {
  const toast = useToast();

  const { members } = useStore((state) => ({
    members: state.members,
  }));
  return (
    <Modal show={isOpen} backdrop={true} centered onHide={onCancel}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <TeamDetail
          members={members}
          onCancel={onCancel}
          projectAccessId={projectAccessId}
        />
      </div>
    </Modal>
  );
}
