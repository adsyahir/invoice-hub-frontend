import { RouterProvider } from "react-router-dom";
import { AppProviders } from "@/app/providers";
import { useAuthBootstrap } from "@/app/useAuthBootstrap";
import { router } from "@/router";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function AppRoutes() {
  // Restore the session (refresh token) before rendering routes.
  useAuthBootstrap();
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
      <ReactQueryDevtools initialIsOpen={false} />

    </AppProviders>
  );
}
