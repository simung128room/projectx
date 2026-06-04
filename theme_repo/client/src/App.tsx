import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import CheckerPage from "./pages/CheckerPage";
import SessionPage from "./pages/SessionPage";
import ProxyPage from "./pages/ProxyPage";
import HistoryPage from "./pages/HistoryPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/checker" component={CheckerPage} />
      <Route path="/session/:id" component={SessionPage} />
      <Route path="/proxies" component={ProxyPage} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "oklch(0.09 0 0)",
                border: "1px solid oklch(0.22 0 0)",
                color: "oklch(0.97 0 0)",
                fontFamily: "Space Mono, monospace",
                fontSize: "0.75rem",
                borderRadius: "0",
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
