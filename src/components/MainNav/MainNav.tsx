import Link from "next/link";
import { cn } from "@/lib/utils";

export function MainNav({
	className,
	...props
}: React.HTMLAttributes<HTMLElement>) {
	return (
		<nav
			className={cn("flex items-center space-x-4 lg:space-x-6", className)}
			{...props}
		>
			<Link
				className="text-sm font-medium transition-colors hover:text-primary"
				href="/examples/dashboard"
			>
        Dashboard
			</Link>
			<Link
				className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
				href="/examples/dashboard"
			>
        Projects
			</Link>
			<Link
				className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
				href="/examples/dashboard"
			>
        Schedule
			</Link>
			<Link
				className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
				href="/examples/dashboard"
			>
        Agent
			</Link>
			<Link
				className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
				href="/documents"
			>
        Documents
			</Link>
			<Link
				className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
				href="/examples/dashboard"
			>
        Members
			</Link>
			<Link
				className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
				href="/examples/dashboard"
			>
        Integration
			</Link>
			{/* <Link
        href="/examples/dashboard"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Configuration
      </Link> */}
		</nav>
	);
}
