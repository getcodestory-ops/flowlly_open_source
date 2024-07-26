import React from "react";
import { useStore } from "@/utils/store";

interface HydrationHandlerProps {
  children: React.ReactNode;
}

const HydrationHandler: React.FC<HydrationHandlerProps> = ({ children }) => {
  const hasHydrated = useStore((state) => state._hasHydrated);

  if (!hasHydrated) {
    // You can render a loading state here if you want
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default HydrationHandler;
