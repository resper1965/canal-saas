import * as React from "react";
import { ToastProvider } from "./components/ui/Toast";
import { createBrowserRouter, RouterProvider, useParams, useRouteError } from "react-router";

const LoginPage = React.lazy(() => import("./routes/login"));
const DashboardLayout = React.lazy(() => import("./routes/dashboard"));
const CollectionPage = React.lazy(() => import("./routes/collection"));
const MediaPage = React.lazy(() => import("./routes/media"));
const BrandbookPage = React.lazy(() => import("./routes/brandbook"));
const SignaturesPage = React.lazy(() => import("./routes/signatures"));
const SaasSettingsPage = React.lazy(() => import("./routes/saas"));
const AccountSettingsPage = React.lazy(() => import("./routes/account"));
const UsersPage = React.lazy(() => import("./routes/users"));
const OrganizationsPage = React.lazy(() => import("./routes/organizations"));
const DashboardHome = React.lazy(() => import("./routes/dashboard-home"));
const DecksPage = React.lazy(() => import("./routes/decks"));
const NewslettersPage = React.lazy(() => import("./routes/newsletters"));
const AISettingsPage = React.lazy(() => import("./routes/ai-settings"));
const CommunicationsPage = React.lazy(() => import("./routes/communications"));
const CompliancePage = React.lazy(() => import("./routes/compliance"));
const AutomationPage = React.lazy(() => import("./routes/automation"));
const EmergencyPage = React.lazy(() => import("./routes/emergency"));
const SaasBillingPage = React.lazy(() => import("./routes/saas-billing"));
const KnowledgeBasePage = React.lazy(() => import("./routes/knowledge-base"));
const ChatsHistoryPage = React.lazy(() => import("./routes/chats"));
const ApplicantsPage = React.lazy(() => import("./routes/applicants"));
const SocialCalendarPage = React.lazy(() => import("./routes/social-calendar"));
const PublicationsPage = React.lazy(() => import("./routes/publications"));
const OnboardingWizard = React.lazy(() => import("./routes/onboarding-wizard"));
const HelpPage = React.lazy(() => import("./routes/help"));
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

function CollectionRoute({ slug }: { slug: string }) {
  return <CollectionPage slug={slug} />;
}

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
      { path: "insights", element: <CollectionRoute slug="insights" /> },
      { path: "publications", element: <PublicationsPage /> },
      { path: "cases", element: <CollectionRoute slug="cases" /> },
      { path: "jobs", element: <CollectionRoute slug="jobs" /> },
      { path: "applicants", element: <ApplicantsPage /> },
      { path: "pages", element: <CollectionRoute slug="pages" /> },
      { path: "brandbook", element: <BrandbookPage /> },
      { path: "signatures", element: <SignaturesPage /> },
      { path: "decks", element: <DecksPage /> },
      { path: "newsletters", element: <NewslettersPage /> },
      { path: "ai-settings", element: <AISettingsPage /> },
      { path: "communications", element: <CommunicationsPage /> },
      { path: "media", element: <MediaPage /> },
      { path: "saas", element: <SaasSettingsPage /> },
      { path: "account", element: <AccountSettingsPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "organizations", element: <OrganizationsPage /> },
      { path: "compliance", element: <CompliancePage /> },
      { path: "knowledge-base", element: <KnowledgeBasePage /> },
      { path: "chats", element: <ChatsHistoryPage /> },
      { path: "social-calendar", element: <SocialCalendarPage /> },
      { path: "automation", element: <AutomationPage /> },
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
