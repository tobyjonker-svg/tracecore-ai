/**
 * TraceCore AI — App Router
 * Design: Soft-Dark Enterprise (dark mode default)
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AICommandProvider } from "./contexts/AICommandContext";
import DashboardLayout from "./components/DashboardLayout";

// Pages
import Home from "./pages/Home";
import Suppliers from "./pages/Suppliers";
import { Inputs } from "./pages/Inputs";
import Products from "./pages/Products";
import { InventoryLog } from "./pages/InventoryLog";
import { Batches } from "./pages/Batches";
import { SupplierPerformance } from "./pages/SupplierPerformance";
import { Alerts } from "./pages/Alerts";
import { Dashboard } from "./pages/Dashboard";
import { SettingsMVP } from "./pages/SettingsMVP";
import { ReportsMVP } from "./pages/ReportsMVP";
import { ImportExportMVP } from "./pages/ImportExportMVP";
import { SecurityMVP } from "./pages/SecurityMVP";
import { AIChat } from "./pages/AIChat";
import { VoiceCommandCenter } from "./pages/VoiceCommandCenter";
import { VoiceAnalytics } from "./pages/VoiceAnalytics";
import { CustomVoiceCommands } from "./pages/CustomVoiceCommands";
import { VoiceCommandScheduling } from "./pages/VoiceCommandScheduling";
import { RealTimeExecution } from "./pages/RealTimeExecution";
import { CommandPermissions } from "./pages/CommandPermissions";
import { CommandTemplates } from "./pages/CommandTemplates";
import { CommandAuditLog } from "./pages/CommandAuditLog";
import { CommandChaining } from "./pages/CommandChaining";
import { MobileVoiceInterface } from "./pages/MobileVoiceInterface";
import { OrdersComplete } from "./pages/OrdersComplete";
import { ProductionComplete } from "./pages/ProductionComplete";
import { ShipmentsComplete } from "./pages/ShipmentsComplete";
import Orders from "./pages/Orders";
import ProductionRuns from "./pages/ProductionRuns";
import InventoryActivity from "./pages/InventoryActivity";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AIAssistant from "./pages/AIAssistant";
import AdminPaymentDashboard from "./pages/AdminPaymentDashboard";
import WorkflowAnalytics from "./pages/WorkflowAnalytics";
import ProfitMarginReport from "./pages/ProfitMarginReport";
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import NotFound from "./pages/NotFound";

function PaymentRoute() {
  const tier = new URLSearchParams(window.location.search).get('tier') as 'pro' | 'pro_plus' | null;
  return tier ? <PaymentConfirmation tier={tier} /> : <NotFound />;
}

function DashboardRouter() {
  // Dashboard routes (protected by DashboardLayout)
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/app" component={Dashboard} />
        <Route path="/home" component={Home} />
        <Route path="/" component={Home} />
        <Route path="/suppliers" component={Suppliers} />
        <Route path="/inputs" component={Inputs} />
        <Route path="/products" component={Products} />
        <Route path="/orders" component={Orders} />
        <Route path="/production" component={ProductionRuns} />
        <Route path="/inventory-log" component={InventoryLog} />
        <Route path="/batches" component={Batches} />
        <Route path="/supplier-performance" component={SupplierPerformance} />
        <Route path="/alerts" component={Alerts} />
        <Route path="/inventory" component={InventoryActivity} />
        <Route path="/reports" component={Reports} />
        <Route path="/profit-margin" component={ProfitMarginReport} />
        <Route path="/settings" component={SettingsMVP} />
        <Route path="/reports-mvp" component={ReportsMVP} />
        <Route path="/import-export" component={ImportExportMVP} />
        <Route path="/app/security" component={SecurityMVP} />
        <Route path="/app/ai-chat" component={AIChat} />
        <Route path="/app/voice-commands" component={VoiceCommandCenter} />
        <Route path="/app/voice-analytics" component={VoiceAnalytics} />
        <Route path="/app/custom-commands" component={CustomVoiceCommands} />
        <Route path="/app/command-scheduling" component={VoiceCommandScheduling} />
        <Route path="/app/realtime-execution" component={RealTimeExecution} />
        <Route path="/app/command-permissions" component={CommandPermissions} />
        <Route path="/app/command-templates" component={CommandTemplates} />
        <Route path="/app/audit-log" component={CommandAuditLog} />
        <Route path="/app/command-chaining" component={CommandChaining} />
        <Route path="/app/mobile-voice" component={MobileVoiceInterface} />
        <Route path="/orders-complete" component={OrdersComplete} />
        <Route path="/production-complete" component={ProductionComplete} />
        <Route path="/shipments-complete" component={ShipmentsComplete} />
        <Route path="/ai-assistant" component={AIAssistant} />
        <Route path="/admin/payments" component={AdminPaymentDashboard} />
        <Route path="/admin/analytics" component={WorkflowAnalytics} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function Router() {
  // Main router - specific routes first, then catch-all
  // IMPORTANT: Landing route MUST be last because path="/" matches all paths in wouter
  return (
    <Switch>
      <Route path="/pricing" component={Pricing} />
      <Route path="/payment" component={PaymentRoute} />
      <Route component={DashboardRouter} />
      <Route path="/" component={Landing} />
    </Switch>
  );
}

function App() {
  // Clear localStorage if this is a new user flow
  if (typeof window !== 'undefined') {
    const isNewUser = new URLSearchParams(window.location.search).get('newUser') === 'true';
    if (isNewUser) {
      localStorage.removeItem('tracecore-ai-state');
      localStorage.removeItem('tracecore-ai-onboarded');
    }
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <AppProvider>
            <AICommandProvider>
              <TooltipProvider>
                <Toaster
                  theme="dark"
                  position="bottom-right"
                  toastOptions={{
                    style: {
                      background: 'oklch(0.165 0.009 265)',
                      border: '1px solid oklch(1 0 0 / 9%)',
                      color: 'oklch(0.92 0.005 265)',
                    },
                  }}
                />
                <Router />
              </TooltipProvider>
            </AICommandProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
