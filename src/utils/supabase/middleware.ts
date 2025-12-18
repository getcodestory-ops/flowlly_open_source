import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Routes that don't require authentication
const publicRoutes = ["/applogin", "/auth/callback", "/api"];

// Check if a path is public
function isPublicRoute(pathname: string): boolean {
	return publicRoutes.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`),
	);
}

// Fetch projects from API in middleware
async function fetchProjects(
	accessToken: string,
): Promise<{ project_id: string }[]> {
	try {
		const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/projects?project_type=SCHEDULE`;
		const response = await fetch(url, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			return [];
		}

		const data = await response.json();
		return data?.projects || [];
	} catch {
		return [];
	}
}

export const updateSession = async (request: NextRequest) => {
	try {
		// Create an unmodified response
		let response = NextResponse.next({
			request: {
				headers: request.headers,
			},
		});

		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				cookies: {
					getAll() {
						return request.cookies.getAll();
					},
					setAll(cookiesToSet) {
						cookiesToSet.forEach(({ name, value }) =>
							request.cookies.set(name, value),
						);
						response = NextResponse.next({
							request,
						});
						cookiesToSet.forEach(({ name, value, options }) =>
							response.cookies.set(name, value, options),
						);
					},
				},
			},
		);

		// Get the current pathname
		const pathname = request.nextUrl.pathname;

		// Refresh session and get user
		const {
			data: { user },
		} = await supabase.auth.getUser();

		// Unauthenticated user trying to access protected route
		if (!user && !isPublicRoute(pathname)) {
			const redirectUrl = new URL("/applogin", request.url);
			return NextResponse.redirect(redirectUrl);
		}

		// Authenticated user on root or /project - redirect to their project
		if (user && (pathname === "/" || pathname === "/project")) {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (session?.access_token) {
				const projects = await fetchProjects(session.access_token);

				if (projects.length > 0 && projects[0].project_id) {
					const redirectUrl = new URL(
						`/project/${projects[0].project_id}/agent`,
						request.url,
					);
					return NextResponse.redirect(redirectUrl);
				} else {
					// No projects - redirect to create new project
					const redirectUrl = new URL("/project/new", request.url);
					return NextResponse.redirect(redirectUrl);
				}
			} else {
				// User exists but session/access_token is missing - redirect to login
				const redirectUrl = new URL("/applogin", request.url);
				return NextResponse.redirect(redirectUrl);
			}
		}

		return response;
	} catch (e) {
		// If you are here, a Supabase client could not be created!
		// This is likely because you have not set up environment variables.
		return NextResponse.next({
			request: {
				headers: request.headers,
			},
		});
	}
};
