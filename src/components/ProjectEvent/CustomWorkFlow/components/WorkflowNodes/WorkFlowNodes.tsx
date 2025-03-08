import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
	WorkflowFormData,
	WorkflowNode,
	FlowCondition,
	NodeType,
	BaseNodeConfig,
	NodeStatus,
	LoopNodeConfig,
} from "../../types";
import { useWorkflowNodes } from "../../hooks/useWorkflowNodes";
import ReactFlow, {
	Background,
	Controls,
	Edge,
	Handle,
	Node,
	Position,
	MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import {
	PlusCircle,
	ArrowDown,
	Trash2,
	Edit,
	Folder,
	File,
} from "lucide-react";
import { NodeTypeSelector } from "./NodeTypeSelector";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WorkflowNodesProps {
  formData: WorkflowFormData;
  onChange: (updates: Partial<WorkflowFormData>) => void;
}

const flattenWorkflowNodes = (nodes: WorkflowNode[]) => {
	const flatNodes: Array<{
    node: WorkflowNode;
    parent?: WorkflowNode;
    condition?: FlowCondition;
    level: number;
  }> = [];
	const processedNodeIds = new Set<string>();

	const processNode = (
		node: WorkflowNode,
		parentNode?: WorkflowNode,
		condition?: FlowCondition,
		level: number = 0,
	) => {
		// Only process each node once
		if (!processedNodeIds.has(node.id)) {
			processedNodeIds.add(node.id);
			flatNodes.push({
				node,
				parent: parentNode,
				condition,
				level,
			});

			const config = node.config as BaseNodeConfig;
			if (config.next_steps?.length) {
				config.next_steps.forEach((step) => {
					const targetNode = nodes.find((n) => n.id === step.target_node_id);
					if (targetNode) {
						processNode(targetNode, node, step.condition, level + 1);
					}
				});
			}
		}
	};

	// Start with nodes that have no parents
	nodes.forEach((node) => {
		const isChildNode = nodes.some((n) =>
			(n.config as BaseNodeConfig).next_steps?.some(
				(step) => step.target_node_id === node.id,
			),
		);
		if (!isChildNode) {
			processNode(node);
		}
	});

	return flatNodes;
};

// Update the generateStepNumber function
const generateStepNumber = (
	flatNodes: Array<{
    node: WorkflowNode;
    parent?: WorkflowNode;
    condition?: FlowCondition;
    level: number;
  }>,
	currentIndex: number,
): string => {
	// Simply use sequential numbers for all steps
	const stepNumber = currentIndex + 1;
	const currentNode = flatNodes[currentIndex];

	// If it's a root node (no parent), just return the number
	if (!currentNode.parent) {
		return stepNumber.toString();
	}

	// For child nodes, return the number with a reference to parent
	const parentIndex = flatNodes.findIndex(
		(item) => item.node.id === currentNode.parent?.id,
	);
	const parentNumber = parentIndex + 1;

	const pathType =
    currentNode.condition === FlowCondition.SUCCESS
    	? "success path from"
    	: currentNode.condition === FlowCondition.FAILURE
    		? "failure path from"
    		: "following";

	return `${stepNumber} (${pathType} step ${parentNumber})`;
};

// Update the CONNECTION_LINE_STYLES
const CONNECTION_LINE_STYLES = {
	[FlowCondition.SUCCESS]: "absolute left-4 w-0.5 bg-green-300",
	[FlowCondition.FAILURE]: "absolute left-4 w-0.5 bg-red-300",
	[FlowCondition.ALWAYS]: "absolute left-4 w-0.5 bg-gray-300",
};

// Update the AddNodeContext interface
interface AddNodeContext {
  parentId?: string;
  condition?: FlowCondition;
}

// Add this helper function at the top level
const calculateNodePosition = (
	node: WorkflowNode,
	nodes: WorkflowNode[],
	index: number,
) => {
	let xOffset = 100;
	let yOffset = index * 150;

	// Find if this node is a child node
	const parentNode = nodes.find((n) =>
		(n.config as BaseNodeConfig).next_steps?.some(
			(step) => step.target_node_id === node.id,
		),
	);

	if (parentNode) {
		// Find the parent's position in the nodes array
		const parentIndex = nodes.indexOf(parentNode);

		// Use parent's y position plus offset for child nodes
		yOffset = parentIndex * 150 + 150;

		const parentConfig = parentNode.config as BaseNodeConfig;
		const stepIndex = parentConfig.next_steps.findIndex(
			(step) => step.target_node_id === node.id,
		);

		// If it's a failure path, position it to the right
		if (
			parentConfig.next_steps[stepIndex]?.condition === FlowCondition.FAILURE
		) {
			xOffset = 400;
		}
		// If it's a success path, position it slightly to the left
		else if (
			parentConfig.next_steps[stepIndex]?.condition === FlowCondition.SUCCESS
		) {
			xOffset = 100;
		}
	}

	return { x: xOffset, y: yOffset };
};

export function WorkflowNodes({ formData, onChange }: WorkflowNodesProps) {
	const {
		currentNodeType,
		setCurrentNodeType,
		handleDeleteNode,
		handleEditNode,
		getEditingNode,
		resetNodeState,
	} = useWorkflowNodes({ formData, onChange });

	const [nodes, setNodes] = useState<Node[]>([]);
	const [edges, setEdges] = useState<Edge[]>([]);

	// Add new state for tracking where we're adding a node
	const [addNodeContext, setAddNodeContext] = useState<AddNodeContext | null>(
		null,
	);

	// Modify handleAddNode to ensure unique IDs
	const handleAddNode = (nodeData: WorkflowNode) => {
		const updatedNodes = [...formData.nodes];

		// Create new node with complete data
		const newNode: WorkflowNode = {
			...nodeData,
			id: crypto.randomUUID(), // Generate unique ID on frontend
			status: NodeStatus.PENDING,
			timestamp: new Date().toISOString(),
			retry_count: 0,
		};

		if (addNodeContext) {
			const { parentId, condition } = addNodeContext;
			const parentNode = updatedNodes.find((node) => node.id === parentId);

			if (parentNode) {
				parentNode.config.next_steps.push({
					target_node_id: newNode.id,
					condition: condition || FlowCondition.ALWAYS,
					metadata: {},
				});
			}
		}

		updatedNodes.push(newNode);
		onChange({ nodes: updatedNodes });
		setCurrentNodeType("");
		setAddNodeContext(null);
	};

	const renderNodeContent = (node: WorkflowNode) => {
		switch (node.type) {
			case NodeType.VALIDATE:
				return (
					<div className="space-y-2">
						<p className="text-sm text-gray-600">{node.title}</p>
						<p className="text-xs text-gray-500">
							{node.config.validationPrompt}
						</p>
						{/* Show connected steps */}
						<div className="space-y-2 mt-4">
							<div className="text-sm font-medium">Connected Steps:</div>
							{node.config.next_steps.map((step, index) => (
								<div
									className={`text-xs ${
										step.condition === FlowCondition.SUCCESS
											? "text-green-600"
											: step.condition === FlowCondition.FAILURE
												? "text-red-600"
												: "text-gray-600"
									}`}
									key={index}
								>
									{step.condition === FlowCondition.SUCCESS
										? "✓ If Valid: "
										: step.condition === FlowCondition.FAILURE
											? "✗ If Invalid: "
											: "→ Always: "}
									{
										formData.nodes.find(
											(n: WorkflowNode) => n.id === step.target_node_id,
										)?.title
									}
								</div>
							))}
						</div>
						{node.status !== NodeStatus.PENDING && (
							<div className="text-xs text-gray-500">
                Status: {node.status}
								{node.error && <p className="text-red-500">{node.error}</p>}
							</div>
						)}
					</div>
				);

			case NodeType.EXTRACTION:
				return (
					<div className="space-y-2">
						<p className="text-sm text-gray-600">{node.title}</p>
						<div className="flex flex-wrap gap-2">
							{node.config.columns?.map((col: any, index: number) => (
								<span
									className="px-2 py-1 bg-blue-100 rounded-md text-xs"
									key={index}
								>
									{col.name}: {col.dataType}
								</span>
							))}
						</div>
						{node.status !== NodeStatus.PENDING && (
							<div className="text-xs text-gray-500">Status: {node.status}</div>
						)}
					</div>
				);

			case NodeType.EXCEL:
				return (
					<div className="space-y-2">
						<p className="text-sm text-gray-600">{node.title}</p>
						<div className="text-xs text-gray-500">
							<p>Sheet: {node.config.sheet_name}</p>
							<p>Operation: {node.config.operation}</p>
							{node.config.range && <p>Range: {node.config.range}</p>}
						</div>
						{node.config.columns && (
							<div className="flex flex-wrap gap-2">
								{node.config.columns.map((col: any, index: number) => (
									<span
										className="px-2 py-1 bg-green-100 rounded-md text-xs"
										key={index}
									>
										{col.name} → {col.sourceField}
									</span>
								))}
							</div>
						)}
						{node.status !== NodeStatus.PENDING && (
							<div className="text-xs text-gray-500">
                Status: {node.status}
								{node.error && <p className="text-red-500">{node.error}</p>}
							</div>
						)}
					</div>
				);

			case NodeType.DOCUMENT_EXTRACTION:
				return (
					<div className="space-y-2">
						<p className="text-sm text-gray-600">{node.title}</p>
						<div className="text-xs text-gray-500">
							<p className="font-medium">Extraction Prompt:</p>
							<p className="ml-2">
								{node.config.extractionPrompt.slice(0, 100)}...
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							{node.config.columns?.map((col: any, index: number) => (
								<span
									className="px-2 py-1 bg-blue-100 rounded-md text-xs"
									key={index}
								>
									{col.name}: {col.dataType}
								</span>
							))}
						</div>
						<div className="text-xs text-gray-500">
							<p className="font-medium">Source Documents:</p>
							<div className="ml-2 space-y-1">
								{node.config.selectedItems.map((item: any) => (
									<p className="flex items-center" key={item.id}>
										{item.type === "folder" ? (
											<Folder className="h-3 w-3 mr-1 text-blue-500" />
										) : (
											<File className="h-3 w-3 mr-1 text-green-500" />
										)}
										{item.name}
									</p>
								))}
							</div>
						</div>
						{node.status !== NodeStatus.PENDING && (
							<div className="text-xs text-gray-500">
                Status: {node.status}
								{node.error && <p className="text-red-500">{node.error}</p>}
							</div>
						)}
					</div>
				);

			default:
				return (
					<div className="space-y-2">
						<p className="text-sm text-gray-600">{node.title}</p>
						<p className="text-xs text-gray-500">Status: {node.status}</p>
					</div>
				);
		}
	};

	// Update useEffect to handle loop node connections
	useEffect(() => {
		// Convert workflow nodes to ReactFlow nodes with calculated positions
		const flowNodes = formData.nodes.map((node, index) => ({
			id: node.id,
			type: "custom",
			position: calculateNodePosition(node, formData.nodes, index),
			data: node,
		}));

		// Create edges with updated styling
		const flowEdges: Edge[] = formData.nodes.flatMap((node) => {
			const edges: Edge[] = [];

			// Handle regular next_steps connections
			const config = node.config as BaseNodeConfig;
			if (config.next_steps) {
				edges.push(
					...config.next_steps.map((step) => ({
						id: `${node.id}-${step.target_node_id}`,
						source: node.id,
						target: step.target_node_id,
						type: "smoothstep",
						style: {
							stroke:
                step.condition === FlowCondition.SUCCESS
                	? "#22c55e"
                	: step.condition === FlowCondition.FAILURE
                		? "#ef4444"
                		: "#94a3b8",
							strokeWidth: 2,
						},
						animated: true,
						markerEnd: {
							type: MarkerType.ArrowClosed,
							color:
                step.condition === FlowCondition.SUCCESS
                	? "#22c55e"
                	: step.condition === FlowCondition.FAILURE
                		? "#ef4444"
                		: "#94a3b8",
						},
					})),
				);
			}

			// Handle loop node connections
			if (node.type === NodeType.LOOP) {
				const loopConfig = node.config as LoopNodeConfig;
				if (loopConfig.target_node_id) {
					edges.push({
						id: `${node.id}-loop-${loopConfig.target_node_id}`,
						source: node.id,
						target: loopConfig.target_node_id,
						type: "smoothstep",
						animated: true,
						style: {
							stroke: "#6366f1",
							strokeWidth: 2,
						},
						markerEnd: {
							type: MarkerType.ArrowClosed,
							color: "#6366f1",
						},
					});
				}
			}

			return edges;
		});

		setNodes(flowNodes);
		setEdges(flowEdges);
	}, [formData.nodes]);

	// Update the render function to show Add Step buttons in appropriate places
	return (
		<div className="grid grid-cols-3 gap-6 h-[calc(100vh-300px)]">
			{/* Document Flow Builder */}
			<ScrollArea className="border rounded-lg p-4 col-span-2">
				<div className="space-y-4">
					<Label>Workflow Steps</Label>
					{/* Move Node Type Selector to the bottom */}
					<div className="space-y-4 mt-6 relative">
						{flattenWorkflowNodes(formData.nodes).map(
							(nodeInfo, index, array) => (
								<div className="relative" key={nodeInfo.node.id}>
									{/* Connection line styling */}
									{nodeInfo.condition && (
										<div
											className={CONNECTION_LINE_STYLES[nodeInfo.condition]}
											style={{
												top: "-24px",
												height: "calc(100% + 24px)",
											}}
										/>
									)}
									{/* Node content */}
									<div
										className={`border rounded-lg p-4 bg-white shadow-sm ml-8 ${
											nodeInfo.condition === FlowCondition.SUCCESS
												? "border-l-4 border-l-green-500"
												: nodeInfo.condition === FlowCondition.FAILURE
													? "border-l-4 border-l-red-500"
													: nodeInfo.condition === FlowCondition.ALWAYS
														? "border-l-4 border-l-gray-500"
														: ""
										}`}
									>
										<div className="flex justify-between items-center mb-3">
											<div className="flex items-center space-x-2">
												<span className="font-medium text-lg">
                          Step{" "}
													{generateStepNumber(
														flattenWorkflowNodes(formData.nodes),
														index,
													)}
												</span>
												<span className="px-2 py-1 bg-primary/10 rounded text-sm capitalize">
													{nodeInfo.node.type}
												</span>
												{nodeInfo.condition && (
													<span
														className={`text-sm px-2 py-1 rounded ${
															nodeInfo.condition === FlowCondition.SUCCESS
																? "bg-green-100 text-green-700"
																: nodeInfo.condition === FlowCondition.FAILURE
																	? "bg-red-100 text-red-700"
																	: "bg-gray-100 text-gray-700"
														}`}
													>
														{nodeInfo.condition === FlowCondition.SUCCESS
															? "If Valid"
															: nodeInfo.condition === FlowCondition.FAILURE
																? "If Invalid"
																: "Next"}
														{nodeInfo.parent &&
                              ` (from step ${
                              	formData.nodes.indexOf(nodeInfo.parent) + 1
                              })`}
													</span>
												)}
											</div>
											<div className="flex space-x-2">
												<Button
													onClick={() => handleEditNode(nodeInfo.node.id)}
													size="sm"
													variant="ghost"
												>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													onClick={() => handleDeleteNode(nodeInfo.node.id)}
													size="sm"
													variant="ghost"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
										{renderNodeContent(nodeInfo.node)}
									</div>
									{/* Add Step buttons - Only show if not currently adding a node */}
									{!currentNodeType && (
										<div className="ml-8 mt-4 mb-6 grid grid-cols-3 gap-2">
											<Button
												className="border-green-500 text-green-700"
												onClick={() => {
													setCurrentNodeType("validate");
													setAddNodeContext({
														parentId: nodeInfo.node.id,
														condition: FlowCondition.SUCCESS,
													});
												}}
												size="sm"
												variant="outline"
											>
												<PlusCircle className="h-4 w-4 mr-2" />
                        What to do if successful
											</Button>
											<Button
												className="border-red-500 text-red-700"
												onClick={() => {
													setCurrentNodeType("validate");
													setAddNodeContext({
														parentId: nodeInfo.node.id,
														condition: FlowCondition.FAILURE,
													});
												}}
												size="sm"
												variant="outline"
											>
												<PlusCircle className="h-4 w-4 mr-2" />
                        What to do if failed
											</Button>
											{/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentNodeType("validate");
                          setAddNodeContext({
                            parentId: nodeInfo.node.id,
                            condition: FlowCondition.ALWAYS,
                          });
                        }}
                        className="border-gray-500 text-gray-700"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Always run this step
                      </Button> */}
										</div>
									)}
									{/* Arrow between nodes */}
									{index < array.length - 1 && (
										<div className="flex justify-center my-2 ml-8">
											<ArrowDown className="h-6 w-6 text-gray-400" />
										</div>
									)}
								</div>
							),
						)}
					</div>
					{/* Node Type Selector - show at the position where we're adding */}
					{currentNodeType && (
						<div className="ml-8 mt-4">
							<NodeTypeSelector
								currentNodeType={currentNodeType}
								editingNode={getEditingNode()}
								existingNodes={formData.nodes}
								onCancel={() => {
									resetNodeState();
									setAddNodeContext(null);
								}}
								onSave={handleAddNode}
								setCurrentNodeType={setCurrentNodeType}
							/>
						</div>
					)}
					{/* First node button */}
					{!currentNodeType && formData.nodes.length === 0 && (
						<Button
							className="w-full mt-4"
							onClick={() => setCurrentNodeType("validate")}
							variant="outline"
						>
							<PlusCircle className="h-4 w-4 mr-2" />
              Add First Step
						</Button>
					)}
				</div>
			</ScrollArea>
			{/* Update Graph View */}
			<div className="border rounded-lg">
				<ReactFlow
					defaultEdgeOptions={{
						type: "smoothstep",
						animated: true,
					}}
					edges={edges}
					fitView
					nodeTypes={{ custom: CustomNode }}
					nodes={nodes}
				>
					<Background />
					<Controls />
				</ReactFlow>
			</div>
		</div>
	);
}

// Update CustomNode component
const CustomNode = ({ data }: { data: WorkflowNode }) => {
	return (
		<div className="border rounded-lg p-4 bg-white min-w-[200px]">
			<Handle position={Position.Top} type="target" />
			<Handle
				id="right"
				position={Position.Right}
				type="target"
			/>
			<div className="space-y-2">
				<div className="font-medium">{data.title}</div>
				<div className="text-sm text-gray-500 capitalize">{data.type}</div>
				<div className="text-xs text-gray-400">{data.status}</div>
			</div>
			<Handle position={Position.Bottom} type="source" />
			<Handle
				id="right"
				position={Position.Right}
				type="source"
			/>
		</div>
	);
};
