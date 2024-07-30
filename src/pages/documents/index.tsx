import { Metadata } from "next";
import Image from "next/image";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDateRangePicker } from "@/components/ProjectDashboard/components/DateRangePicker";
import { MainNav } from "@/components/MainNav/MainNav";
import { Search } from "@/components/ProjectDashboard/components/Search";
import ProjectSwitcher from "@/components/ProjectDashboard/components/ProjectSwitcher";
import { UserNav } from "@/components/ProjectDashboard/components/UserNav";
import Sidebar from "@/components/Layout/Sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Construction Documentation </title>
        <meta
          name="description"
          content="Personal assistant for construction professionals"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <QueryClientProvider client={queryClient}>
          <div className="hidden flex-col md:flex h-screen">
            <div className="border-b">
              <div className="flex h-16 items-center px-4">
                <ProjectSwitcher />
                <MainNav className="mx-6" />
                <div className="ml-auto flex items-center space-x-4">
                  <Search />
                  <UserNav />
                </div>
              </div>
            </div>
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <div className="flex-1 space-y-4 p-8 pt-6">content</div>
            </div>
          </div>
        </QueryClientProvider>
      </main>
    </>
  );
}
