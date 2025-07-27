import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
  component: React.ReactNode;
}

interface MobileTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function MobileTabs({ tabs, activeTab, onTabChange }: MobileTabsProps) {
  const getTabColors = (tabId: string, isActive: boolean) => {
    if (tabId === "balance") {
      return isActive 
        ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-lg border-2 border-white" 
        : "text-ios-cyan";
    }
    if (tabId === "goals") {
      return isActive 
        ? "bg-gradient-to-r from-orange-600 to-pink-600 text-white shadow-lg border-2 border-white" 
        : "text-ios-orange";
    }
    if (tabId === "chores") {
      return isActive 
        ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg border-2 border-white" 
        : "text-ios-green";
    }
    return isActive ? "bg-blue-600 text-white shadow-lg border-2 border-white" : "text-ios-gray";
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-gradient-to-r from-ios-purple to-ios-pink safe-area">
      <div className="flex justify-around py-2 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center py-3 px-4 text-xs transition-all duration-200 rounded-2xl font-bold",
                getTabColors(tab.id, isActive),
                isActive && "scale-110 -translate-y-1"
              )}
            >
              <Icon className="text-2xl mb-1" />
              <span className="text-sm font-black">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
