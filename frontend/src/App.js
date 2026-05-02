import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import { AgeVerificationGate } from "@/components/layout/AgeVerificationGate";
import DashboardPage from "@/pages/DashboardPage";
import AdminPanelPage from "@/pages/AdminPanelPage";
import PrivacyPage from "@/pages/PrivacyPage";
import ProfilePage from "@/pages/ProfilePage";
import ReminderCenterPage from "@/pages/ReminderCenterPage";
import ShopOnlinePage from "@/pages/ShopOnlinePage";
import StoreFinderPage from "@/pages/StoreFinderPage";
import SupportPage from "@/pages/SupportPage";
import TermsPage from "@/pages/TermsPage";
import { VaultProvider } from "@/context/VaultContext";

function App() {
  useEffect(() => {
    const tagEmergentLink = () => {
      const candidates = Array.from(document.querySelectorAll("a, button, div"));
      const target = candidates.find((element) =>
        element.textContent?.trim().includes("Made with Emergent"),
      );

      if (target) {
        target.setAttribute("data-testid", "made-with-emergent-link");
      }
    };

    tagEmergentLink();
    const observer = new MutationObserver(() => tagEmergentLink());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <VaultProvider>
      <div className="App" data-testid="app-root">
        <BrowserRouter>
          <AgeVerificationGate />
          <Routes>
            <Route element={<DashboardPage />} path="/" />
            <Route element={<AdminPanelPage />} path="/admin" />
            <Route element={<ProfilePage />} path="/profiles/:profileId" />
            <Route element={<ReminderCenterPage />} path="/reminders" />
            <Route element={<StoreFinderPage />} path="/stores" />
            <Route element={<ShopOnlinePage />} path="/shop" />
            <Route element={<PrivacyPage />} path="/privacy" />
            <Route element={<TermsPage />} path="/terms" />
            <Route element={<SupportPage />} path="/support" />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </div>
    </VaultProvider>
  );
}

export default App;
