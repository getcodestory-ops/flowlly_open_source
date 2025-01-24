In order to add a new node to the workflow.

Decide what is the function of the node and what kind of config it needs.
After that we need to follow these steps to create a new node:

1. First we need to create right type for the node in src\components\ProjectEvent\CustomWorkFlow\types.ts
   To add type first add NodeConfig interface in the file and then add the type to the NodeType enum. then add the type to the WorkflowNode interface.

   example type

```
   export interface OutlookAttachmentsNodeConfig extends BaseNodeConfig {
  type: "outlook_attachments";
  project_access_id?: string;
  message_id?: string;
}
```

we need to add this type to WorkflowNode
example

````| {
      type: NodeType.OUTLOOK_ATTACHMENTS;
      config: OutlookAttachmentsNodeConfig;
      title: string;
    }| ```
2. Then we need to create a new Node in src\components\ProjectEvent\CustomWorkFlow\components\WorkflowNodes
   For example, if we want to add a new node type called "RecipeNode", we need to create a new file called `RecipeNode.tsx` in the `WorkflowNodes` folder.

Here is an example of how to add a new node type:

````

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
WorkflowNode,
NodeStatus,
NodeType,
ConversationNodeConfig,
} from "../../types";
import { NodeTypeSelector } from "./NodeTypeSelector";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface ConversationNodeProps {
onSave: (node: WorkflowNode) => void;
onCancel: () => void;
editingNode?: WorkflowNode;
existingNodes: WorkflowNode[];
}

export function ConversationNode({
onSave,
onCancel,
editingNode,
existingNodes,
}: ConversationNodeProps) {
const [config, setConfig] = useState<ConversationNodeConfig>({
message_template: "",
format_as_table: false,
notification_channels: ["twilio"],
next_steps: [],
retry_count: 0,
max_retries: 3,
});

useEffect(() => {
if (editingNode && editingNode.type === NodeType.CONVERSATION) {
setConfig(editingNode.config as ConversationNodeConfig);
}
}, [editingNode]);

return (
<Card>
<CardContent className="space-y-4 pt-6">
<div className="space-y-4">
<div className="space-y-2">
<Label htmlFor="message_template">Message Template</Label>
<Input
id="message_template"
value={config.message_template}
onChange={(e) =>
setConfig((prev) => ({
...prev,
message_template: e.target.value,
}))
}
placeholder="Enter message template..."
/>
</div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="format_as_table"
              checked={config.format_as_table}
              onCheckedChange={(checked) =>
                setConfig((prev) => ({
                  ...prev,
                  format_as_table: checked as boolean,
                }))
              }
            />
            <Label htmlFor="format_as_table">Format response as table</Label>
          </div>
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
                type: NodeType.CONVERSATION,
                title: "Conversation Step",
                config,
                status: NodeStatus.PENDING,
                timestamp: new Date().toISOString(),
                retry_count: 0,
              } as WorkflowNode);
            }}
            disabled={!config.message_template}
          >
            {editingNode ? "Update" : "Add"} Node
          </Button>
        </div>
      </CardContent>
    </Card>

);
}

```

3. Then we need to add a new option to the `NodeTypeSelector` component in src\components\ProjectEvent\CustomWorkFlow\components\WorkflowNodes\NodeTypeSelector.tsx

4. Finally we need to add option to the `nodeConfigs` object in src\components\ProjectEvent\CustomWorkFlow\components\WorkflowNodes\nodeUtils.ts

example
```

outlook_attachments: {
value: "outlook_attachments",
label: "Outlook Attachments",
icon: "📄",
getDescription: (node) => `Get attachments from Outlook email`,
},

```

```
