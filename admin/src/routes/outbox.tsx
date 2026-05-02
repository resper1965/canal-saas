import { useState, lazy, Suspense } from "react";
import { PageSpinner } from "../components/ui/Spinner";

const InboxTab = lazy(() => import("./communications"));
const NewslettersTab = lazy(() => import("./newsletters"));

const TABS = [
  { id: "inbox", label: "Inbox" },
  { id: "newsletters", label: "Newsletters" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function OutboxPage() {
  const [activeTab, setActiveTab] = useState<TabId>("inbox");

  return (
    <div className="flex flex-col h-full">
      {/* Tab Bar */}
      <div className="shrink-0 px-6 pt-4">
        <div className="flex gap-1 bg-card border border-border rounded-lg p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-8 px-4 rounded-md text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={<PageSpinner />}>
          {activeTab === "inbox" && <InboxTab />}
          {activeTab === "newsletters" && <NewslettersTab />}
        </Suspense>
      </div>
    </div>
  );
}
