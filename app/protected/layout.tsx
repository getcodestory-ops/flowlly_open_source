import "@/styles/globals.css";

import Image from "next/image";
import { Archivo_Black } from "next/font/google";

// import { MainNav } from "@/components/MainNav/MainNav";
import { Search } from "@/components/ProjectDashboard/components/Search";
import ProjectSwitcher from "@/components/ProjectDashboard/components/ProjectSwitcher";
import { UserNav } from "@/components/ProjectDashboard/components/UserNav";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-col">
      <div className="md:hidden">
        <Image
          src="/examples/dashboard-light.png"
          width={1280}
          height={866}
          alt="Dashboard"
          className="block dark:hidden"
        />
        <Image
          src="/examples/dashboard-dark.png"
          width={1280}
          height={866}
          alt="Dashboard"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden flex-col md:flex">
        <div className="border-b">
          <div className="flex h-16 items-center px-4 gap-4">
            <div className={`${archivoBlack.className} text-2xl`}>FLOWLLY</div>
            <ProjectSwitcher />
            {/* <MainNav className="mx-6" /> */}
            <div className="ml-auto flex items-center space-x-4">
              <Search />
              <UserNav />
            </div>
          </div>
        </div>
        <div className="flex  overflow-hidden">
          {/* <Sidebar /> */}
          {children}
        </div>
      </div>
    </main>
  );
}
