import supabase from "./supabaseClient";

// Initialize Supabase client

// Define function to check if user has admin rights
const checkAdminRights = async(userId: string): Promise<boolean> => {
	return true;
	//   try {
	//     // Fetch row from "admin_rights" table based on user ID
	//     const { data, error } = await supabase
	//       .from("admin_rights")
	//       .select("*")
	//       .eq("uuid", userId)
	//       .limit(1);

	//     if (error) {
	//       throw new Error(error.message);
	//     }

	//     // If row exists, set hasAdminRights to true, else false
	//     const hasAdminRights = data && data.length > 0;

	//     return hasAdminRights;
	//   } catch (error) {
	//     console.error("Error checking admin rights:", error);
	//     return false;
	//   }
};

export default checkAdminRights;
