import "@/styles/globals.css";
import { Archivo_Black } from "next/font/google";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
// import { Search } from "@/components/ProjectDashboard/components/Search";
// import ProjectSwitcher from "@/components/ProjectDashboard/components/ProjectSwitcher";
// import { UserNav } from "@/components/ProjectDashboard/components/UserNav";

// const archivoBlack = Archivo_Black({
//   weight: "400",
//   subsets: ["latin"],
// });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/applogin");
  }

  // const onLogout = async () => {
  //   "use server";
  //   console.log("logging out");

  //   const supabase = createClient();
  //   await supabase.auth.signOut();
  //   return redirect("/applogin");
  // };

  return (
    <main className="flex flex-col relative">
      <div className="hidden flex-col md:flex">
        {/* <div className="border-b">
          <div className="flex h-16 items-center px-4 gap-4">
            <div className={`${archivoBlack.className} text-2xl`}>FLOWLLY</div>
            <ProjectSwitcher />
            <div className="ml-auto flex items-center space-x-4">
              <Search />
              <UserNav email={user.email ?? ""} />
            </div>
          </div>
        </div> */}
        <div className="flex  overflow-hidden">{children}</div>
      </div>
    </main>
  );
}
