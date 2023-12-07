import ScheduleInterface from "@/Layouts/ScheduleInterface";
import { useRouter } from "next/router";

export default function DashboardPage() {
  const router = useRouter();
  const { slug } = router.query ?? "";

  return <ScheduleInterface view={slug} />;
}
