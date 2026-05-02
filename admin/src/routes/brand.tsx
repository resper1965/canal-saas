import { useState, lazy, Suspense } from "react";
import { PageSpinner } from "../components/ui/Spinner";

const BrandbookTab = lazy(() => import("./brandbook"));
const SignaturesTab = lazy(() => import("./signatures"));
const DecksTab = lazy(() => import("./decks"));

const TABS = [
  { id: "brandbook", label: "Brand Book" },
  { id: "signatures", label: "Assinaturas" },
  { id: "decks", label: "Apresentações" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function BrandHubPage() {
  const [activeTab, setActiveTab] = useState<TabId>("brandbook");

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
          {activeTab === "brandbook" && <BrandbookTab />}
          {activeTab === "signatures" && <SignaturesTab />}
          {activeTab === "decks" && <DecksTab />}
        </Suspense>
      </div>
    </div>
  );
}
