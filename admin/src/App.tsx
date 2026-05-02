import * as React from "react";
import { ToastProvider } from "./components/ui/Toast";
import { createBrowserRouter, RouterProvider, useParams, useRouteError } from "react-router";

const LoginPage = React.lazy(() => import("./routes/login"));
const DashboardLayout = React.lazy(() => import("./routes/dashboard"));
const MediaPage = React.lazy(() => import("./routes/media"));
const SaasSettingsPage = React.lazy(() => import("./routes/saas"));
const AccountSettingsPage = React.lazy(() => import("./routes/account"));
const UsersPage = React.lazy(() => import("./routes/users"));
const OrganizationsPage = React.lazy(() => import("./routes/organizations"));
const DashboardHome = React.lazy(() => import("./routes/dashboard-home"));
const CompliancePage = React.lazy(() => import("./routes/compliance"));
const EmergencyPage = React.lazy(() => import("./routes/emergency"));
const SaasBillingPage = React.lazy(() => import("./routes/saas-billing"));
const ChatsHistoryPage = React.lazy(() => import("./routes/chats"));
const ApplicantsPage = React.lazy(() => import("./routes/applicants"));
const SocialCalendarPage = React.lazy(() => import("./routes/social-calendar"));
const OnboardingWizard = React.lazy(() => import("./routes/onboarding-wizard"));
const HelpPage = React.lazy(() => import("./routes/help"));
const BrandHubPage = React.lazy(() => import("./routes/brand"));
const OutboxPage = React.lazy(() => import("./routes/outbox"));
const IntelligencePage = React.lazy(() => import("./routes/intelligence"));
const ContentRoute = React.lazy(() => import("./routes/content"));
function GlobalErrorBoundary() {
  const error = useRouteError() as Error;
  
  // Auto-reload if failed to load dynamically imported module (due to new build)
  if (error && error.message && error.message.includes('fetch dynamically imported module')) {
    window.location.reload();
    return <div className="loader" />;
  }

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', color: 'red' }}>
      <h2>Ocorreu um erro no Dashboard</h2>
      <pre style={{ fontSize: 13, background: 'rgba(255,0,0,0.1)', padding: 16, borderRadius: 8 }}>
        {error?.message || "Erro interno"}
      </pre>
      <button onClick={() => window.location.reload()} style={{ marginTop: 20, padding: '10px 20px', cursor: 'pointer' }}>
        Recarregar Aplicação
      </button>
    </div>
  );
}

const CollectionPage = React.lazy(() => import("./routes/collection"));

function DynamicCrudRoute() {
  const { slug } = useParams();
  return <CollectionPage slug={slug!} />;
}

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage />, errorElement: <GlobalErrorBoundary /> },
  { path: "/onboarding", element: <OnboardingWizard />, errorElement: <GlobalErrorBoundary /> },
  {
    path: "/",
    element: <DashboardLayout />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      { index: true, element: <DashboardHome /> },
      // Unified content route
      { path: "content/:slug", element: <ContentRoute /> },
      // Legacy content aliases
      { path: "insights", element: <ContentRoute /> },
      { path: "publications", element: <ContentRoute /> },
      { path: "cases", element: <ContentRoute /> },
      { path: "jobs", element: <ContentRoute /> },
      { path: "pages", element: <ContentRoute /> },
      { path: "applicants", element: <ApplicantsPage /> },
      // Unified Hubs
      { path: "brand", element: <BrandHubPage /> },
      { path: "outbox", element: <OutboxPage /> },
      { path: "intelligence", element: <IntelligencePage /> },
      // Legacy aliases (redirect to hubs)
      { path: "brandbook", element: <BrandHubPage /> },
      { path: "signatures", element: <BrandHubPage /> },
      { path: "decks", element: <BrandHubPage /> },
      { path: "newsletters", element: <OutboxPage /> },
      { path: "communications", element: <OutboxPage /> },
      { path: "ai-settings", element: <IntelligencePage /> },
      { path: "knowledge-base", element: <IntelligencePage /> },
      { path: "automation", element: <IntelligencePage /> },
      // Individual routes
      { path: "media", element: <MediaPage /> },
      { path: "saas", element: <SaasSettingsPage /> },
      { path: "account", element: <AccountSettingsPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "organizations", element: <OrganizationsPage /> },
      { path: "compliance", element: <CompliancePage /> },
      { path: "chats", element: <ChatsHistoryPage /> },
      { path: "social-calendar", element: <SocialCalendarPage /> },
      { path: "emergency", element: <EmergencyPage /> },
      { path: "saas-billing", element: <SaasBillingPage /> },
      { path: "crud/:slug", element: <DynamicCrudRoute /> },
      { path: "help", element: <HelpPage /> },
    ],
  },
]);

export default function App() {
  return (
    <ToastProvider>
      <React.Suspense fallback={<div className="loader" />}>
        <RouterProvider router={router} />
      </React.Suspense>
    </ToastProvider>
  );
}
