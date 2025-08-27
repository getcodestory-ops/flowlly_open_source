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
		<div className="relative">
			<Providers>
				<WorkflowStack />
				{children}
			</Providers>
			{/* <TemporaryButtonForWorkflowStack /> */}
		</div>
	);
}
