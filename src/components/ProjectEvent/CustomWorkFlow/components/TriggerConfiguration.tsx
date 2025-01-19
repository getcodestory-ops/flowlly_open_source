import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkflowFormData } from "../types";
import { AuthorizedUserSelector } from "./AuthorizedUserSelector";
import { ProjectEntity } from "@/types/projects";

interface TriggerConfigurationProps {
  formData: WorkflowFormData;
  onChange: (updates: Partial<WorkflowFormData>) => void;
  members: any[]; // Replace 'any' with your member type
  activeProject: ProjectEntity; // Add this line
}

const availablePhones = [
  // { phoneNumber: "+17788003869", type: "reserved" },
  { phoneNumber: "+12344234145", type: "general" },
  { phoneNumber: "+15068001231", type: "general" },
];

export function TriggerConfiguration({
  formData,
  onChange,
  members,
  activeProject,
}: TriggerConfigurationProps) {
  return (
    <div className="space-y-4">
      {(formData.triggerBy === "ui" ||
        formData.triggerBy === "email_subject") && (
        <div className="space-y-2">
          <Label htmlFor="triggerKeyword">
            {formData.triggerBy === "email_subject"
              ? "Email Subject"
              : "Optional: Starting Prompt"}
          </Label>
          <Textarea
            id="startingPrompt"
            value={formData.triggerKeyword}
            onChange={(e) => onChange({ triggerKeyword: e.target.value })}
            required
          />
        </div>
      )}

      {formData.triggerBy === "phone" && (
        <PhoneTriggerConfig
          formData={formData}
          onChange={onChange}
          members={members}
          activeProject={activeProject}
        />
      )}
    </div>
  );
}

function PhoneTriggerConfig({
  formData,
  onChange,
  members,
  activeProject,
}: TriggerConfigurationProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Select Phone Number</Label>
        <div className="text-sm text-muted-foreground mb-2">
          Users will be able to send messages to this phone number to start{" "}
          {formData.workflowFor}.
        </div>
        <Select
          name="triggerByKey"
          value={formData.triggerByKey}
          onValueChange={(value) => {
            const selectedPhoneType = availablePhones.find(
              (p) => p.phoneNumber === value
            )?.type;

            const accessBy =
              selectedPhoneType === "reserved" ? "any" : "project_access";
            const accessByKey =
              selectedPhoneType === "reserved"
                ? "any"
                : activeProject.project_id;

            onChange({
              triggerByKey: value,
              accessBy,
              accessByKey,
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a phone number" />
          </SelectTrigger>
          <SelectContent>
            {availablePhones.map((phone) => (
              <SelectItem key={phone.phoneNumber} value={phone.phoneNumber}>
                {phone.phoneNumber} ({phone.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.triggerByKey && (
        <PhoneConfiguration
          formData={formData}
          onChange={onChange}
          members={members}
          phoneType={
            availablePhones.find((p) => p.phoneNumber === formData.triggerByKey)
              ?.type
          }
          activeProject={activeProject}
        />
      )}
    </>
  );
}

function PhoneConfiguration({
  formData,
  onChange,
  members,
  phoneType,
  activeProject,
}: TriggerConfigurationProps & { phoneType?: string }) {
  if (!phoneType) return null;

  return (
    <>
      {phoneType === "reserved" ? (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="accessBy"
            checked={formData.accessBy === "any"}
            onCheckedChange={(checked) =>
              onChange({
                accessBy: checked ? "any" : "project_access",
                accessByKey: checked ? "any" : activeProject.project_id,
              })
            }
          />
          <Label htmlFor="allowAnyUser">Allow anyone to send messages</Label>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="triggerPrompt">Trigger Prompt</Label>
          <div className="text-sm text-muted-foreground mb-2">
            Start {formData.workflowFor} by sending a message to{" "}
            {formData.triggerByKey} beginning with @{formData.triggerKeyword}
          </div>
          <Input
            id="triggerPrompt"
            value={formData.triggerKeyword}
            onChange={(e) => onChange({ triggerKeyword: e.target.value })}
            placeholder="Enter trigger word (without @, example: delivery, pickup, rfi, report, schedule)"
            required
          />
        </div>
      )}

      {phoneType === "general" && (
        <div className="space-y-2">
          <Label>Authorized Users</Label>
          <div className="text-sm text-muted-foreground mb-2">
            Please select users who can use this worker
          </div>
          <AuthorizedUserSelector
            members={members}
            selectedUsers={formData.authorizedUsers}
            onChange={(users) => onChange({ authorizedUsers: users })}
          />
        </div>
      )}
    </>
  );
}
