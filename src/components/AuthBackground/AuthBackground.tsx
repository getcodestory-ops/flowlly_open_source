import { Toaster } from "@/components/ui/toaster";

import Image from "next/image";
export const AuthBackground = ({ children }: { children: React.ReactNode }) => {
	return (
		<main>
			<Toaster />
			<div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] bg-white">
				{children}
				<div className="hidden bg-white lg:block  flex content-center xl:mt-32">
					<Image
						alt="Logo"
						className="mx-auto"
						height="400"
						src="https://upthcaewktgrqjieqiya.supabase.co/storage/v1/object/public/images/hero-v2.c5845c47e7c7d49cf5c1.png"
						width="800"
					/>
				</div>
			</div>
		</main>
	);
};
