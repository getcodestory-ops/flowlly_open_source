// Config object to be passed to Msal on creation
export const msalConfig = {
	auth: {
		grantType: "client_credentials",
		clientId: process.env.NEXT_PUBLIC_graph_client_id ?? "",
		clientSecret: process.env.NEXT_PUBLIC_graph_client_secret ?? "",
		authority: process.env.NEXT_PUBLIC_graph_authority ?? "",
		redirectUri: process.env.NEXT_PUBLIC_redirect_uri ?? "",
		postLogoutRedirectUri: "/",
	},
	system: {
		allowNativeBroker: false,
	},
};

export const loginRequest = {
	scopes: ["User.Read", "Mail.Read", "email"],
};

export const graphConfig = {
	graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};
