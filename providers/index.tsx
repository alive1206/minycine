"use client";

import { Provider as JotaiProvider } from "jotai";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AuthInitializer } from "@/lib/auth-initializer";
import { appStore } from "@/lib/store";

export const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 2,
          },
        },
      }),
  );

  return (
    <JotaiProvider store={appStore}>
      <QueryClientProvider client={queryClient}>
        <HeroUIProvider>
          <ToastProvider placement="bottom-center" />
          <AuthInitializer />
          {children}
        </HeroUIProvider>
      </QueryClientProvider>
    </JotaiProvider>
  );
};
