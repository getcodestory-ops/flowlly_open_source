"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/utils/store";
import { MemberEntity } from "@/types/members";
import { Edit, Save, Trash2, X } from "lucide-react";
import { usePhoneRegistration } from "@/components/PhoneRegistration/usePhoneRegistration";
import ConsentModal from "@/components/PhoneRegistration/ConsentModal";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function ProjectSetup() {
  const { activeProject } = useStore((state) => ({
    activeProject: state.activeProject,
  }));

  const {
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
  } = usePhoneRegistration();

  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);

  const handleAddMemberClick = () => setAddingMember(!addingMember);

  const renderProjectMembers = () => (
    <div className="flex flex-col pt-4 overflow-auto">
      <ConsentModal
        isOpen={isConsentModalOpen}
        onOpen={() => setIsConsentModalOpen(true)}
        onClose={() => setIsConsentModalOpen(false)}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleAddMemberClick}
        className="self-start mb-4"
      >
        Add Member
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Enroll IN SMS</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {addingMember && (
            <TableRow>
              <TableCell>
                <Input
                  type="text"
                  placeholder="First Name"
                  value={newMember.first_name}
                  onChange={(e) => handleInputChange(e, "first_name")}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={newMember.last_name}
                  onChange={(e) => handleInputChange(e, "last_name")}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="email"
                  placeholder="Email"
                  value={newMember.email}
                  onChange={(e) => handleInputChange(e, "email")}
                />
              </TableCell>
              <TableCell>
                <PhoneInput
                  international
                  defaultCountry="US"
                  value={newMember.phone}
                  onChange={(value) =>
                    handleInputChange({ target: { value } }, "phone")
                  }
                />
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={newMember.enable_sms}
                  onCheckedChange={(checked) => {
                    handleInputChange({ target: { checked } }, "enable_sms");
                    if (checked) setIsConsentModalOpen(true);
                  }}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="text"
                  placeholder="Role"
                  value={newMember.role}
                  onChange={(e) => handleInputChange(e, "role")}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="text"
                  placeholder="Language"
                  value={newMember.language}
                  onChange={(e) => handleInputChange(e, "language")}
                />
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={handleSaveMember}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAddMemberClick}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          )}
          {members?.data?.map((member: MemberEntity) => (
            <TableRow key={member.id}>
              {editMember?.id !== member.id ? (
                <>
                  <TableCell>{member.first_name}</TableCell>
                  <TableCell>{member.last_name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>
                    {!member.phone ? (
                      <span className="font-bold">
                        Add phone number to enroll
                      </span>
                    ) : (
                      <Checkbox
                        checked={
                          !!member?.phone_registration?.[0]?.phone_number
                        }
                        onCheckedChange={(checked) =>
                          registerPhoneNumber(!!checked, member.phone)
                        }
                      />
                    )}
                  </TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>{member?.language ?? "English"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const { phone_registration, ...otherProps } = member;
                        setEditMember({ ...otherProps });
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMember(member.email)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell>
                    <Input
                      type="text"
                      placeholder="First Name"
                      value={editMember.first_name}
                      onChange={(e) => handleMemberEdit(e, "first_name")}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      placeholder="Last Name"
                      value={editMember.last_name}
                      onChange={(e) => handleMemberEdit(e, "last_name")}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={editMember.email}
                      onChange={(e) => handleMemberEdit(e, "email")}
                    />
                  </TableCell>
                  <TableCell>
                    <PhoneInput
                      international
                      defaultCountry="US"
                      value={editMember.phone}
                      onChange={(value) =>
                        handleMemberEdit({ target: { value } }, "phone")
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={editMember.enable_sms}
                      onCheckedChange={(checked) => {
                        handleMemberEdit({ target: { checked } }, "enable_sms");
                        if (checked) setIsConsentModalOpen(true);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      placeholder="Role"
                      value={editMember.role}
                      onChange={(e) => handleMemberEdit(e, "role")}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      placeholder="Language"
                      value={editMember.language}
                      onChange={(e) => handleMemberEdit(e, "language")}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={updatememberDetails}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setAddingMember(false);
                        setEditMember(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-full text-3xl font-black text-primary">
        Select or create a project at the top left corner
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background rounded-xl p-4">
      {renderProjectMembers()}
    </div>
  );
}
