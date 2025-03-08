export default function LoaderAnimation() {
	return (
		<div className="flex items-center justify-center h-full">
			<div className="relative w-48 h-48">
				<div className="absolute  inset-0 rounded-full bg-gradient-to-tr from-transparent via-purple-500/20 to-transparent animate-pulse" />
				<div className="absolute  inset-0 rounded-full border-2 border-purple-500/20 animate-[ping_3s_ease-in-out_infinite]" />
			</div>
		</div>
	);
}
