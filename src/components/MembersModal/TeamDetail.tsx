"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IoMdClose } from "react-icons/io";
import { Separator } from "@/components/ui/separator";
import { MemberEntity } from "@/types/members";

export function TeamDetail({
  members,
  onCancel,
}: {
  members: MemberEntity[];
  onCancel: () => void;
}) {
  return (
    <Card className="">
      <CardHeader className="pb-3 flex flex-row justify-between">
        <div>
          <CardTitle className="pb-3">Members of the Organization</CardTitle>
          <CardDescription>
            Send email to invite users to the organization
          </CardDescription>
        </div>
        <Button
          size="sm"
          className="shrink-0"
          variant="secondary"
          onClick={onCancel}
        >
          <IoMdClose />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Label htmlFor="link" className="sr-only">
            Link
          </Label>
          <Input id="link" placeholder="example@exmple.com" />
          <Button className="shrink-0" size="sm">
            Send Invite
          </Button>
        </div>
        <Separator className="my-4" />
        <div className="space-y-4">
          <h4 className="text-sm font-medium">People with access</h4>
          <div className="grid gap-6 max-h-96 overflow-y-auto">
            {members &&
              members.length > 0 &&
              members.map((member, i) => (
                <MemberRow
                  key={`member-${i}`}
                  name={member.first_name + " " + member.last_name}
                  email={member.email}
                />
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
    // </div>
  );
}

const MemberRow = ({ name, email }: { name: string; email: string }) => {
  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src="/avatars/03.png" alt="Image" />
          <AvatarFallback>IN</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium leading-none">{name}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>
      <Select defaultValue="view">
        <SelectTrigger className="ml-auto w-[110px]" aria-label="Edit">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {/* <SelectItem value="edit">Admin</SelectItem> */}
          <SelectItem value="view">Member</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
