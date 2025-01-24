import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  WorkflowNode,
  NodeStatus,
  NodeType,
  RecipeNodeConfig,
  RecipeConfig,
} from "../../types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Placeholder recipe configurations
const MOCK_RECIPES: RecipeConfig[] = [
  {
    id: "recipe1",
    name: "Data Processing Recipe",
    description: "Process data with custom parameters",
    inputFields: [
      {
        name: "inputFile",
        type: "text",
        required: true,
        label: "Input File Path",
      },
      {
        name: "maxRows",
        type: "number",
        required: false,
        label: "Max Rows to Process",
      },
      {
        name: "includeHeaders",
        type: "boolean",
        required: true,
        label: "Include Headers",
      },
    ],
  },
  {
    id: "recipe2",
    name: "Text Analysis Recipe",
    description: "Analyze text content",
    inputFields: [
      { name: "content", type: "text", required: true, label: "Text Content" },
      { name: "language", type: "text", required: false, label: "Language" },
    ],
  },
];

interface RecipeNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
  existingNodes: WorkflowNode[];
}

export function RecipeNode({
  onSave,
  onCancel,
  editingNode,
  existingNodes,
}: RecipeNodeProps) {
  const [config, setConfig] = useState<RecipeNodeConfig>({
    type: "recipe",
    selectedRecipeId: "",
    inputValues: {},
    next_steps: [],
    retry_count: 0,
    max_retries: 0,
  });
  const [recipes, setRecipes] = useState<RecipeConfig[]>(MOCK_RECIPES);

  useEffect(() => {
    if (editingNode && editingNode.type === NodeType.RECIPE) {
      setConfig(editingNode.config as RecipeNodeConfig);
    }
    // In real implementation, fetch recipes from backend here
  }, [editingNode]);

  const selectedRecipe = recipes.find((r) => r.id === config.selectedRecipeId);

  const renderInputField = (field: RecipeConfig["inputFields"][0]) => {
    switch (field.type) {
      case "text":
      case "number":
        return (
          <Input
            type={field.type}
            value={config.inputValues[field.name] || ""}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                inputValues: {
                  ...prev.inputValues,
                  [field.name]: e.target.value,
                },
              }))
            }
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        );
      case "boolean":
        return (
          <Checkbox
            checked={config.inputValues[field.name] || false}
            onCheckedChange={(checked) =>
              setConfig((prev) => ({
                ...prev,
                inputValues: {
                  ...prev.inputValues,
                  [field.name]: checked,
                },
              }))
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Recipe</Label>
            <Select
              value={config.selectedRecipeId}
              onValueChange={(value) =>
                setConfig((prev) => ({
                  ...prev,
                  selectedRecipeId: value,
                  inputValues: {}, // Reset input values when recipe changes
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a recipe..." />
              </SelectTrigger>
              <SelectContent>
                {recipes.map((recipe) => (
                  <SelectItem key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRecipe && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                {selectedRecipe.description}
              </p>
              {selectedRecipe.inputFields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  {renderInputField(field)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onSave({
                id: editingNode?.id || crypto.randomUUID(),
                type: NodeType.RECIPE,
                title: selectedRecipe?.name || "Recipe Step",
                config,
                status: NodeStatus.PENDING,
                timestamp: new Date().toISOString(),
                retry_count: 0,
              } as WorkflowNode);
            }}
            disabled={!config.selectedRecipeId}
          >
            {editingNode ? "Update" : "Add"} Node
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
