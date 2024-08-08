import { getProjects } from "@/api/projectRoutes";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

import MainLayout from "@/Layouts/MainProtectedLayout";

export default async function ProtectedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/applogin");
  }
  //first get session
  const { data: session } = await supabase.auth.getSession();
  if (session === null || session.session === null) {
    return redirect("/applogin");
  }
  //fetch projects here
  const projects = await getProjects(session.session);

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full">
        <MainLayout />
      </div>
    </div>
  );
}
