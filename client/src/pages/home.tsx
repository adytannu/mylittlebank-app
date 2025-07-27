import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BalanceTab from "@/components/balance-tab";
import GoalsTab from "@/components/goals-tab";
import ChoresTab from "@/components/chores-tab";
import MobileTabs from "@/components/ui/mobile-tabs";
import { Wallet, Target, ListChecks } from "lucide-react";

type Tab = "balance" | "goals" | "chores";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("balance");

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const tabs = [
    { 
      id: "balance" as Tab, 
      label: "Balance", 
      icon: Wallet,
      component: <BalanceTab />
    },
    { 
      id: "goals" as Tab, 
      label: "Goals", 
      icon: Target,
      component: <GoalsTab />
    },
    { 
      id: "chores" as Tab, 
      label: "Chores", 
      icon: ListChecks,
      component: <ChoresTab />
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-light-gray via-pink-50 to-blue-50 safe-area pb-20">
      {/* Header */}
      <header className="bg-pink-100 shadow-lg px-4 py-6 rounded-b-3xl mx-2 mt-2 border-4 border-white relative overflow-hidden">

        <div className="flex items-center justify-center relative z-10">
          <h1 className="text-4xl font-black text-gray-800 drop-shadow-lg animate-float">MyLittleBank</h1>
        </div>
      </header>

      {/* Tab Content */}
      <main className="px-4 py-6">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </main>

      {/* Bottom Tab Navigation */}
      <MobileTabs 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as Tab)}
      />
    </div>
  );
}
