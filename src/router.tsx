import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { RequireGuest } from "@/components/layout/RequireGuest";
import { RequireRole } from "@/components/layout/RequireRole";
import { RequirePermission } from "@/components/layout/RequirePermission";

import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import AcceptInvitePage from "@/pages/auth/AcceptInvitePage";

import DashboardPage from "@/pages/dashboard/DashboardPage";
import InvoicesPage from "@/pages/invoices/InvoicesPage";
import InvoiceCreatePage from "@/pages/invoices/InvoiceCreatePage";
import InvoiceEditPage from "@/pages/invoices/InvoiceEditPage";
import InvoiceDetailPage from "@/pages/invoices/InvoiceDetailPage";
import ClientsPage from "@/pages/clients/ClientsPage";
import ClientFormPage from "@/pages/clients/ClientFormPage";
import ClientDetailPage from "@/pages/clients/ClientDetailPage";
import PaymentsPage from "@/pages/payments/PaymentsPage";
import ReportsPage from "@/pages/reports/ReportsPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import TeamPage from "@/pages/settings/TeamPage";
import BillingPage from "@/pages/settings/BillingPage";
import TenantsPage from "@/pages/admin/TenantsPage";
import RolesPage from "@/pages/admin/RolesPage";
import UsersPage from "@/pages/admin/UsersPage";

import PaymentPage from "@/pages/public/PaymentPage";
import NotFoundPage from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    element: <RequireGuest />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
          { path: "/reset-password", element: <ResetPasswordPage /> },
          { path: "/invite/accept", element: <AcceptInvitePage /> },
        ],
      },
    ],
  },
  {
    element: <PublicLayout />,
    children: [{ path: "/pay/:token", element: <PaymentPage /> }],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/invoices", element: <InvoicesPage /> },
          { path: "/invoices/new", element: <InvoiceCreatePage /> },
          { path: "/invoices/:id", element: <InvoiceDetailPage /> },
          { path: "/invoices/:id/edit", element: <InvoiceEditPage /> },
          { path: "/clients", element: <ClientsPage /> },
          { path: "/clients/new", element: <ClientFormPage /> },
          { path: "/clients/:id", element: <ClientDetailPage /> },
          { path: "/clients/:id/edit", element: <ClientFormPage /> },
          { path: "/payments", element: <PaymentsPage /> },
          { path: "/reports", element: <ReportsPage /> },
          {
            element: <RequireRole allow={["TENANT_ADMIN", "SUPER_ADMIN"]} />,
            children: [
              { path: "/settings", element: <SettingsPage /> },
              { path: "/settings/team", element: <TeamPage /> },
              { path: "/settings/billing", element: <BillingPage /> },
            ],
          },
          {
            // Platform admin pages — gated by permission, not just role.
            element: <RequirePermission allow="tenant:manage" />,
            children: [
              { path: "/admin/tenants", element: <TenantsPage /> },
              { path: "/admin/users", element: <UsersPage /> },
              { path: "/admin/roles", element: <RolesPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
