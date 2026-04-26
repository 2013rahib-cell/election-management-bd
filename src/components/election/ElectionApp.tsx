'use client';

import { useEffect } from 'react';
import {
  useElectionStore,
  ROLE_TABS,
  ROLE_LABELS,
  TAB_LABELS,
} from '@/lib/election';
import type { Role, TabId } from '@/lib/election';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ShieldCheck,
  Home,
  Search,
  ClipboardList,
  CheckSquare,
  BarChart3,
  Stamp,
  Eye,
  Settings,
} from 'lucide-react';

import HomeTab from './HomeTab';
import VoterSearch from './VoterSearch';
import VoteEntry from './VoteEntry';
import StationVerification from './StationVerification';
import Consolidation from './Consolidation';
import Approval from './Approval';
import PublicResults from './PublicResults';
import AdminPanel from './AdminPanel';

const TAB_ICONS: Record<string, React.ReactNode> = {
  home: <Home className="size-4" />,
  'voter-search': <Search className="size-4" />,
  'vote-entry': <ClipboardList className="size-4" />,
  'station-verification': <CheckSquare className="size-4" />,
  consolidation: <BarChart3 className="size-4" />,
  approval: <Stamp className="size-4" />,
  'public-results': <Eye className="size-4" />,
  'admin-panel': <Settings className="size-4" />,
};

const ROLES: Role[] = ['Voter', 'APO', 'PO', 'ARO', 'RO', 'Admin'];

function TabContent({ tabId }: { tabId: TabId }) {
  switch (tabId) {
    case 'home':
      return <HomeTab />;
    case 'voter-search':
      return <VoterSearch />;
    case 'vote-entry':
      return <VoteEntry />;
    case 'station-verification':
      return <StationVerification />;
    case 'consolidation':
      return <Consolidation />;
    case 'approval':
      return <Approval />;
    case 'public-results':
      return <PublicResults />;
    case 'admin-panel':
      return <AdminPanel />;
    default:
      return (
        <div className="text-muted-foreground text-center py-12">
          Unknown tab
        </div>
      );
  }
}

export default function ElectionApp() {
  const { data, currentRole, currentTab, currentOfficer, setRole, setTab, init } =
    useElectionStore();

  // Initialize store on mount
  useEffect(() => {
    init();
  }, [init]);

  // Don't render until store is initialized (handles SSR + hydration)
  if (!data?.voters) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-emerald-700">
          <ShieldCheck className="size-8 animate-pulse" />
          <span className="text-lg font-medium">Loading Election System...</span>
        </div>
      </div>
    );
  }

  const allowedTabs = ROLE_TABS[currentRole] as TabId[];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 bg-white/20 rounded-lg">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                  Election Management System
                </h1>
                <p className="text-emerald-100 text-xs sm:text-sm">
                  People&apos;s Republic of Bangladesh
                </p>
              </div>
              {/* Bangladesh flag colors stripe */}
              <div className="hidden md:flex ml-3 items-center gap-0.5">
                <div className="w-5 h-3 rounded-sm bg-green-700 border border-green-600" />
                <div className="w-3.5 h-3 rounded-full bg-red-500 -ml-2.5 relative z-10" />
              </div>
            </div>

            {/* Role Selector */}
            <div className="flex items-center gap-3">
              {currentOfficer && (
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{currentOfficer.name}</p>
                  <p className="text-xs text-emerald-200">
                    {ROLE_LABELS[currentRole]}
                  </p>
                </div>
              )}
              <Select value={currentRole} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white hover:bg-white/20 focus:ring-white/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollArea className="w-full">
            <div className="flex gap-1 py-2 overflow-x-auto">
              {allowedTabs.map((tab) => {
                const isActive = currentTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setTab(tab)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {TAB_ICONS[tab]}
                    <span className="hidden sm:inline">{TAB_LABELS[tab]}</span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <TabContent tabId={currentTab} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-800 text-emerald-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm">
              Bangladesh Election Commission — Prototype System
            </p>
            <p className="text-xs text-emerald-300">
              For demonstration purposes only. Not for official use.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
