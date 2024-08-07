"use client";

import { useRouter } from "next/navigation";
export function RedirectButton({
  url,
  name,
  beforeCall,
}: {
  url: string;
  name: string;
  beforeCall?: () => {};
}) {
  const router = useRouter();
  return (
    <div
      onClick={() => {
        if (beforeCall) beforeCall();
        router.push(url);
      }}
    >
      {name}
    </div>
  );
}
