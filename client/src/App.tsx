/**
 * TraceCore AI — App Router
 * Design: Soft-Dark Enterprise (dark mode default)
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AICommandProvider } from "./contexts/AICommandContext";
import DashboardLayout from "./components/DashboardLayout";

// Pages
import Home from "./pages/Home";
import Suppliers from "./pages/Suppliers";
import Inputs from "./pages/Inputs";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import ProductionRuns from "./pages/ProductionRuns";
import InventoryActivity from "./pages/InventoryActivity";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AIAssistant from "./pages/AIAssistant";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/suppliers" component={Suppliers} />
        <Route path="/inputs" component={Inputs} />
        <Route path="/products" component={Products} />
        <Route path="/orders" component={Orders} />
        <Route path="/production" component={ProductionRuns} />
        <Route path="/inventory" component={InventoryActivity} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route path="/ai-assistant" component={AIAssistant} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
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
