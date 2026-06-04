import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Wallet from "./pages/Wallet";
import Tools from "./pages/Tools";
import Admin from "./pages/Admin";
import CheckerLogs from "./pages/CheckerLogs";
import HistoryLogs from "./pages/HistoryLogs";
import ProductDetail from "./pages/ProductDetail";
import PurchaseHistory from "./pages/PurchaseHistory";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Layout>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/shop"} component={Shop} />
        <Route path={"/product"} component={ProductDetail} />
        <Route path={"/purchase-history"} component={PurchaseHistory} />
        <Route path={"/wallet"} component={Wallet} />
        <Route path={"/tools"} component={Tools} />
        <Route path={"/checker-logs"} component={CheckerLogs} />
        <Route path={"/history-logs"} component={HistoryLogs} />
        <Route path={"/admin"} component={Admin} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
