import MainLayout from "@/Layouts/MainProtectedLayout";

export default async function ProtectedPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full">
        <MainLayout />
      </div>
    </div>
  );
}
