import { useState } from "react"
import { TabGroup, TabPanel } from "../../components/ui/Tabs"
import DSARDashboard from "./dsar"
import ROPADashboard from "./ropa"
import IncidentsDashboard from "./incidents"

export default function ComplianceLayout() {
  const [activeTab, setActiveTab] = useState("dsar");

  const tabs = [
    { id: "dsar", label: "DSAR (Pedidos LGPD)" },
    { id: "ropa", label: "ROPA (Inventário)" },
    { id: "incidents", label: "Security Incidents" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden fadeIn bg-background">
      <div className="flex-none px-6 md:px-12 py-8 flex border-b border-border/50 w-full min-w-0 bg-background z-10">
        <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto min-w-0">
          <div className="flex items-center justify-between w-full h-12">
            <div className="flex items-center gap-6">
               <h1 className="text-[22px] font-bold text-foreground">Compliance & Privacidade</h1>
               <span className="text-[14px] font-medium text-muted-foreground bg-muted/40 px-3 py-1 rounded-full border border-border/50">Módulo DPO</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 custom-scrollbar w-full min-w-0">
        <div className="max-w-[1400px] mx-auto min-w-0">
          <div className="mb-8">
            <TabGroup tabs={tabs} active={activeTab} onChange={setActiveTab} />
          </div>
          
          <TabPanel id="dsar" active={activeTab}>
            <DSARDashboard />
          </TabPanel>
          
          <TabPanel id="ropa" active={activeTab}>
            <ROPADashboard />
          </TabPanel>

          <TabPanel id="incidents" active={activeTab}>
            <IncidentsDashboard />
          </TabPanel>
        </div>
      </div>
    </div>
  )
}
