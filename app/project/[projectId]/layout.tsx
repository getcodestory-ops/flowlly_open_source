import { Providers } from "./providers";
import { WorkflowStack } from "@/components/WorkflowStack/WorkflowStack";

export const metadata = {
	title: "Construction Documentation",
	description: "Your personal assistant for construction professionals",
};

export default function RootLayout({
	children,
}: {
  children: React.ReactNode;
}) {
	return (
		<body className="bg-background text-foreground relative">
			<Providers>{children}</Providers>
			<WorkflowStack />
			{/* <TemporaryButtonForWorkflowStack /> */}
		</body>
	);
}
