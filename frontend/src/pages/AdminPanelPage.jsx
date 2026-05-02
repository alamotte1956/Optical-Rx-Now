import { useEffect, useMemo, useState } from "react";
import {
  Apple,
  BarChart3,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Database,
  ExternalLink,
  Globe,
  KeyRound,
  Link2,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useVault } from "@/context/VaultContext";
import {
  ADMIN_STORAGE_KEY_NAME,
  createDefaultAdminState,
  loadAdminState,
  resetAdminState,
  saveAdminState,
  sortAffiliatesByCommission,
} from "@/lib/admin-storage";

const managementLinks = [
  { id: "app-store-connect", label: "App Store Connect", subtitle: "Manage iOS app", href: "https://appstoreconnect.apple.com/", icon: Apple },
  { id: "app-store-analytics", label: "App Store Analytics", subtitle: "iOS downloads, sessions & active users", href: "https://appstoreconnect.apple.com/analytics", icon: BarChart3 },
  { id: "google-play-console", label: "Google Play Console", subtitle: "Manage Android app", href: "https://play.google.com/console/", icon: Play },
  { id: "play-store-statistics", label: "Play Store Statistics", subtitle: "Android installs, ratings & user data", href: "https://play.google.com/console/about/statistics/", icon: BarChart3 },
  { id: "mow-website", label: "My Optical Wallet Website", subtitle: "Company website", href: "https://myopticalwallet.com", icon: Globe },
];

const blankAffiliate = {
  name: "",
  commission: "",
  network: "",
  description: "",
  programUrl: "",
  affiliateId: "",
  active: true,
  verified: false,
};

const SectionTrigger = ({ icon: Icon, label, testId }) => (
  <span className="admin-panel-section-trigger" data-testid={testId}>
    <span className="admin-panel-section-trigger-left">
      <Icon className="h-6 w-6 text-[#56a3ff]" aria-hidden="true" />
      <span>{label}</span>
    </span>
  </span>
);

export default function AdminPanelPage() {
  const navigate = useNavigate();
  const { profiles } = useVault();
  const [adminState, setAdminState] = useState(createDefaultAdminState());
  const [newAffiliate, setNewAffiliate] = useState(blankAffiliate);
  const [expandedAffiliateId, setExpandedAffiliateId] = useState("");
  const [showAffiliateTools, setShowAffiliateTools] = useState(false);
  const [showDataTools, setShowDataTools] = useState(false);

  useEffect(() => {
    setAdminState(loadAdminState());
  }, []);

  const analytics = useMemo(() => {
    const activeAffiliates = adminState.affiliates.filter((affiliate) => affiliate.active).length;
    const averageCommission = adminState.affiliates.length
      ? Math.round(
          (adminState.affiliates.reduce(
            (total, affiliate) => total + Number(affiliate.commission || 0),
            0,
          ) /
            adminState.affiliates.length) *
            10,
        ) / 10
      : 0;

    return [
      { label: "Profiles", value: profiles.length },
      { label: "Affiliates", value: adminState.affiliates.length },
      { label: "Active", value: activeAffiliates },
      { label: "Avg %", value: `${averageCommission}%` },
    ];
  }, [adminState.affiliates, profiles.length]);

  const persistAdminState = (updater, options = {}) => {
    setAdminState((current) => {
      const nextState = typeof updater === "function" ? updater(current) : updater;
      return saveAdminState(nextState, options);
    });
  };

  const clearAllLocalData = async () => {
    window.localStorage.removeItem(ADMIN_STORAGE_KEY_NAME);
    window.localStorage.removeItem("age-verified");
    await new Promise((resolve) => {
      const request = window.indexedDB.deleteDatabase("my-optical-wallet-vault");
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(true);
      request.onblocked = () => resolve(true);
    });
    toast.success("Local app data cleared.");
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="admin-panel-shell" data-testid="admin-panel-page">
      <div className="admin-panel-inner">
        <header className="admin-panel-header" data-testid="admin-panel-header">
          <button className="admin-panel-close-button" data-testid="admin-close-button" onClick={() => navigate("/")} type="button">
            <X className="h-8 w-8" aria-hidden="true" />
          </button>
          <h1 className="admin-panel-title" data-testid="admin-panel-title">Admin Panel</h1>
          <div className="h-8 w-8" aria-hidden="true" />
        </header>

        <Accordion className="space-y-4" collapsible defaultValue="analytics" type="single">
          <AccordionItem className="admin-panel-section border-none" value="analytics">
            <AccordionTrigger className="admin-panel-section-button py-0 no-underline hover:no-underline" data-testid="admin-analytics-trigger">
              <SectionTrigger icon={BarChart3} label="Analytics Dashboard" testId="admin-analytics-trigger-label" />
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
              <div className="grid grid-cols-2 gap-3" data-testid="admin-analytics-grid">
                {analytics.map((item) => (
                  <div className="admin-panel-stat-card" data-testid={`admin-analytics-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} key={item.label}>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem className="admin-panel-section border-none" value="affiliates">
            <AccordionTrigger className="admin-panel-section-button py-0 no-underline hover:no-underline" data-testid="admin-affiliates-trigger">
              <SectionTrigger icon={Link2} label="Affiliate Management" testId="admin-affiliates-trigger-label" />
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
              <div className="admin-panel-note" data-testid="admin-affiliates-ordering-note">
                {adminState.affiliates.length} affiliates listed • ordered from highest commission to lowest after confirmation.
              </div>

              <div className="mt-4 space-y-3">
                {adminState.affiliates.map((affiliate) => (
                  <article className="admin-panel-affiliate-card" data-testid={`admin-affiliate-card-${affiliate.id}`} key={affiliate.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold leading-tight text-white" data-testid={`admin-affiliate-name-${affiliate.id}`}>
                            {affiliate.name}
                          </h3>
                          {affiliate.verified ? <CheckCheck className="h-4 w-4 text-emerald-400" /> : null}
                        </div>
                        <p className="mt-2 text-base text-slate-300" data-testid={`admin-affiliate-meta-${affiliate.id}`}>
                          {affiliate.commission}% Commission
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        className="admin-panel-primary-button"
                        data-testid={`admin-affiliate-save-${affiliate.id}`}
                        onClick={() => {
                          persistAdminState((current) => ({
                            ...current,
                            affiliates: sortAffiliatesByCommission(
                              current.affiliates.map((item) =>
                                item.id === affiliate.id ? { ...item, verified: true } : item,
                              ),
                            ),
                          }));
                          toast.success(`${affiliate.name} updated.`);
                        }}
                        size="sm"
                        type="button"
                      >
                        <KeyRound className="h-3.5 w-3.5" /> {affiliate.affiliateId ? "Edit ID" : "Add ID"}
                      </Button>
                      <Button
                        className="admin-panel-dark-outline"
                        data-testid={`admin-affiliate-open-${affiliate.id}`}
                        onClick={() => window.open(affiliate.programUrl, "_blank", "noopener,noreferrer")}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Open Program
                      </Button>
                    </div>

                    <Collapsible className="mt-4" onOpenChange={(open) => setExpandedAffiliateId(open ? affiliate.id : "")} open={expandedAffiliateId === affiliate.id}>
                      <CollapsibleTrigger asChild>
                        <Button className="admin-panel-dark-outline" data-testid={`admin-affiliate-edit-toggle-${affiliate.id}`} size="sm" type="button" variant="outline">
                          Edit details <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expandedAffiliateId === affiliate.id ? "rotate-180" : ""}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="admin-panel-hidden-tools mt-4">
                          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                            <p className="text-sm text-slate-300" data-testid={`admin-affiliate-id-label-${affiliate.id}`}>
                              Affiliate ID: <span className={`${affiliate.affiliateId ? "text-slate-100" : "text-amber-300"}`}>{affiliate.affiliateId || "Not set"}</span>
                            </p>
                            <Switch checked={affiliate.active} data-testid={`admin-affiliate-toggle-${affiliate.id}`} onCheckedChange={(value) => persistAdminState((current) => ({ ...current, affiliates: current.affiliates.map((item) => item.id === affiliate.id ? { ...item, active: value } : item) }), { sortAffiliates: false })} />
                          </div>
                          <Input className="admin-panel-input" data-testid={`admin-affiliate-id-input-${affiliate.id}`} onChange={(event) => persistAdminState((current) => ({ ...current, affiliates: current.affiliates.map((item) => item.id === affiliate.id ? { ...item, affiliateId: event.target.value } : item) }), { sortAffiliates: false })} placeholder="Affiliate ID not set" value={affiliate.affiliateId} />
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Input className="admin-panel-input" data-testid={`admin-affiliate-commission-input-${affiliate.id}`} onChange={(event) => persistAdminState((current) => ({ ...current, affiliates: current.affiliates.map((item) => item.id === affiliate.id ? { ...item, commission: Number(event.target.value || 0) } : item) }), { sortAffiliates: false })} type="number" value={affiliate.commission} />
                            <Input className="admin-panel-input" data-testid={`admin-affiliate-network-input-${affiliate.id}`} onChange={(event) => persistAdminState((current) => ({ ...current, affiliates: current.affiliates.map((item) => item.id === affiliate.id ? { ...item, network: event.target.value } : item) }), { sortAffiliates: false })} value={affiliate.network} />
                          </div>
                          <Textarea className="admin-panel-input" data-testid={`admin-affiliate-description-input-${affiliate.id}`} onChange={(event) => persistAdminState((current) => ({ ...current, affiliates: current.affiliates.map((item) => item.id === affiliate.id ? { ...item, description: event.target.value } : item) }), { sortAffiliates: false })} value={affiliate.description} />
                          <Input className="admin-panel-input" data-testid={`admin-affiliate-url-input-${affiliate.id}`} onChange={(event) => persistAdminState((current) => ({ ...current, affiliates: current.affiliates.map((item) => item.id === affiliate.id ? { ...item, programUrl: event.target.value } : item) }), { sortAffiliates: false })} value={affiliate.programUrl} />
                          <Button className="admin-panel-danger-outline" data-testid={`admin-affiliate-remove-${affiliate.id}`} onClick={() => { persistAdminState((current) => ({ ...current, affiliates: current.affiliates.filter((item) => item.id !== affiliate.id) })); toast.success(`${affiliate.name} removed.`); }} size="sm" type="button" variant="outline"><Trash2 className="h-3.5 w-3.5" /> Remove Affiliate</Button>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </article>
                ))}
              </div>

              <Collapsible className="mt-4" onOpenChange={setShowAffiliateTools} open={showAffiliateTools}>
                <CollapsibleTrigger asChild>
                  <Button className="admin-panel-dark-outline w-full justify-between" data-testid="admin-affiliate-tools-toggle" type="button" variant="outline">
                    More affiliate tools <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAffiliateTools ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="admin-panel-hidden-tools mt-4" data-testid="admin-add-affiliate-form">
                    <p className="text-sm font-medium text-white">Add affiliate</p>
                    <p className="text-sm text-slate-400">Add a new affiliate, confirm the commission, and it will be inserted in highest-to-lowest order.</p>
                    <div className="grid gap-3 lg:grid-cols-2">
                      <Input className="admin-panel-input" data-testid="admin-new-affiliate-name" onChange={(event) => setNewAffiliate((current) => ({ ...current, name: event.target.value }))} placeholder="Affiliate name" value={newAffiliate.name} />
                      <Input className="admin-panel-input" data-testid="admin-new-affiliate-commission" onChange={(event) => setNewAffiliate((current) => ({ ...current, commission: event.target.value }))} placeholder="Commission %" type="number" value={newAffiliate.commission} />
                      <Input className="admin-panel-input" data-testid="admin-new-affiliate-network" onChange={(event) => setNewAffiliate((current) => ({ ...current, network: event.target.value }))} placeholder="Network or platform" value={newAffiliate.network} />
                      <Input className="admin-panel-input" data-testid="admin-new-affiliate-url" onChange={(event) => setNewAffiliate((current) => ({ ...current, programUrl: event.target.value }))} placeholder="Affiliate site or program URL" value={newAffiliate.programUrl} />
                    </div>
                    <Textarea className="admin-panel-input" data-testid="admin-new-affiliate-description" onChange={(event) => setNewAffiliate((current) => ({ ...current, description: event.target.value }))} placeholder="Short description" value={newAffiliate.description} />
                    <Button className="admin-panel-primary-button w-full sm:w-auto" data-testid="admin-add-affiliate-button" onClick={() => {
                      if (!newAffiliate.name || !newAffiliate.programUrl) {
                        toast.error("Add the affiliate name and site first.");
                        return;
                      }
                      const nextAffiliate = {
                        ...blankAffiliate,
                        ...newAffiliate,
                        id: `${newAffiliate.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
                        commission: Number(newAffiliate.commission || 0),
                      };
                      persistAdminState((current) => ({ ...current, affiliates: sortAffiliatesByCommission([nextAffiliate, ...current.affiliates]) }));
                      setNewAffiliate(blankAffiliate);
                      toast.success("Affiliate added.");
                    }} type="button"><Plus className="h-4 w-4" /> Add affiliate</Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem className="admin-panel-section border-none" value="app-management">
            <AccordionTrigger className="admin-panel-section-button py-0 no-underline hover:no-underline" data-testid="admin-app-management-trigger">
              <SectionTrigger icon={Settings2} label="App Management" testId="admin-app-management-trigger-label" />
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
              <div className="space-y-4">
                {managementLinks.map(({ icon: Icon, ...link }) => (
                  <button className="admin-panel-management-link" data-testid={`admin-management-link-${link.id}`} key={link.id} onClick={() => window.open(link.href, "_blank", "noopener,noreferrer")} type="button">
                    <div className="admin-panel-management-link-left">
                      <div className="admin-panel-management-icon"><Icon className="h-7 w-7 text-[#56a3ff]" aria-hidden="true" /></div>
                      <div>
                        <p className="text-xl font-semibold leading-tight text-white">{link.label}</p>
                        <p className="mt-1 text-sm text-slate-400">{link.subtitle}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-8 w-8 text-slate-400" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem className="admin-panel-section border-none" value="data-management">
            <AccordionTrigger className="admin-panel-section-button py-0 no-underline hover:no-underline" data-testid="admin-data-management-trigger">
              <SectionTrigger icon={Database} label="Data Management" testId="admin-data-management-trigger-label" />
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
              <div className="space-y-4">
                <Button className="admin-panel-data-button" data-testid="admin-reset-age-verification-button" onClick={() => { window.localStorage.removeItem("age-verified"); toast.success("Age verification reset."); }} type="button" variant="outline"><RotateCcw className="h-5 w-5" /> Reset Age Verification</Button>
                <Button className="admin-panel-danger-button" data-testid="admin-clear-all-data-button" onClick={async () => { if (window.confirm("Clear all local app data on this device?")) { await clearAllLocalData(); } }} type="button" variant="outline"><Trash2 className="h-5 w-5" /> Clear All App Data</Button>

                <Collapsible onOpenChange={setShowDataTools} open={showDataTools}>
                  <CollapsibleTrigger asChild>
                    <Button className="admin-panel-dark-outline w-full justify-between" data-testid="admin-data-tools-toggle" type="button" variant="outline">
                      More data tools <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDataTools ? "rotate-180" : ""}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="admin-panel-hidden-tools mt-4">
                      <Button className="admin-panel-dark-outline w-full sm:w-auto" data-testid="admin-restore-default-affiliates-button" onClick={() => { persistAdminState(resetAdminState()); toast.success("Default affiliates restored."); }} type="button" variant="outline"><RotateCcw className="h-4 w-4" /> Restore Default Affiliates</Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <footer className="admin-panel-footer" data-testid="admin-panel-footer">
          <p>My Optical Wallet v1.0.0</p>
          <p>© 2025 My Optical Wallet</p>
        </footer>
      </div>
    </div>
  );
}
