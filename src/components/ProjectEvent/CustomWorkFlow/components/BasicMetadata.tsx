import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkflowFormData } from "../types";

interface BasicMetadataProps {
  formData: WorkflowFormData;
  onChange: (updates: Partial<WorkflowFormData>) => void;
}

export function BasicMetadata({ formData, onChange }: BasicMetadataProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Worker&apos;s Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="workflowFor">What&apos;s this worker for?</Label>
        <Input
          id="workflowFor"
          value={formData.workflowFor}
          onChange={(e) => onChange({ workflowFor: e.target.value })}
          required
        />
      </div>

      {/* <div className="space-y-2">
        <Label htmlFor="startTime">Start Time</Label>
        <Input
          id="startTime"
          type="datetime-local"
          value={formData.startTime}
          onChange={(e) => onChange({ startTime: e.target.value })}
          required
        />
      </div> */}
    </div>
  );
}
