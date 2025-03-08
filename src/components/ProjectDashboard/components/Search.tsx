import { Input } from "@/components/ui/input";

export function Search() {
	return (
		<div>
			<Input
				placeholder="Search..."
				type="search"
				className="md:w-[100px] lg:w-[300px]"
				//no value here for now
				defaultValue=""
			/>
		</div>
	);
}
