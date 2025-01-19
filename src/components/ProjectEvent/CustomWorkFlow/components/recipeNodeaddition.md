In order to add a new node to the workflow.

Decide what is the function of the node and what kind of config it needs.
After that we need to follow these steps to create a new node:

1. First we need to create right type for the node in src\components\ProjectEvent\CustomWorkFlow\types.ts
   To add type first add NodeConfig interface in the file and then add the type to the NodeType enum. then add the type to the WorkflowNode interface.

2. Then we need to create a new Node in src\components\ProjectEvent\CustomWorkFlow\components\WorkflowNodes
   For example, if we want to add a new node type called "RecipeNode", we need to create a new file called `RecipeNode.tsx` in the `WorkflowNodes` folder.

3. Then we need to add a new option to the `NodeTypeSelector` component in src\components\ProjectEvent\CustomWorkFlow\components\WorkflowNodes\NodeTypeSelector.tsx

4. Finally we need to add option to the `nodeConfigs` object in src\components\ProjectEvent\CustomWorkFlow\components\WorkflowNodes\nodeUtils.ts
