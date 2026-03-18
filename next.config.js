/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co").hostname,
				port: "",
				pathname: "**",
			},
		],
	},
};

module.exports = nextConfig;
