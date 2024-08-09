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

interface MembersModalProps {
  onCancel: () => void;
  isOpen: boolean;
}

export function MembersModal({ onCancel, isOpen }: MembersModalProps) {
  const toast = useToast();
  return (
    <Modal show={isOpen} backdrop={true} centered onHide={onCancel}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        Members name
      </div>
    </Modal>
  );
}
