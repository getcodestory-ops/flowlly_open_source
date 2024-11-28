import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkflowNode, ExtractNodeConfig } from "../../types";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";

interface ExtractNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
}

const dataTypes = ["string", "number", "date", "boolean"];

export function ExtractNode({
  onSave,
  onCancel,
  editingNode,
}: ExtractNodeProps) {
  const [config, setConfig] = useState<ExtractNodeConfig>({
    columns: [],
  });

  useEffect(() => {
    if (editingNode && editingNode.type === "extract") {
      setConfig(editingNode.config as ExtractNodeConfig);
    }
  }, [editingNode]);

  const addColumn = () => {
    setConfig((prev) => ({
      ...prev,
      columns: [
        ...prev.columns,
        { name: "", description: "", dataType: "string" },
      ],
    }));
  };

  const removeColumn = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      columns: prev.columns.filter((_, idx) => idx !== index),
    }));
  };

  const updateColumn = (
    index: number,
    field: keyof (typeof config.columns)[0],
    value: string
  ) => {
    setConfig((prev) => ({
      ...prev,
      columns: prev.columns.map((col, idx) =>
        idx === index ? { ...col, [field]: value } : col
      ),
    }));
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        {config.columns.map((column, index) => (
          <div key={index} className="flex gap-4 items-start">
            <div className="flex-1 space-y-2">
              <Label>Column Name</Label>
              <Input
                value={column.name}
                onChange={(e) => updateColumn(index, "name", e.target.value)}
                placeholder="Enter column name..."
              />
            </div>

            <div className="flex-1 space-y-2">
              <Label>Description</Label>
              <Input
                value={column.description}
                onChange={(e) =>
                  updateColumn(index, "description", e.target.value)
                }
                placeholder="Enter description..."
              />
            </div>

            <div className="space-y-2">
              <Label>Data Type</Label>
              <Select
                value={column.dataType}
                onValueChange={(value: any) =>
                  updateColumn(index, "dataType", value)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dataTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeColumn(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addColumn}
          className="w-full"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Column
        </Button>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onSave({
                id: editingNode?.id || crypto.randomUUID(),
                type: "extract",
                config,
              });
            }}
            disabled={config.columns.length === 0}
          >
            {editingNode ? "Update" : "Add"} Node
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
