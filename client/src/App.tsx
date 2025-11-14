import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import NewOrder from "./pages/NewOrder";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      )} />
      
      <Route path="/customers" component={() => (
        <DashboardLayout>
          <Customers />
        </DashboardLayout>
      )} />
      
      <Route path="/products" component={() => (
        <DashboardLayout>
          <Products />
        </DashboardLayout>
      )} />
      
      <Route path="/categories" component={() => (
        <DashboardLayout>
          <Categories />
        </DashboardLayout>
      )} />
      
      <Route path="/orders" component={() => (
        <DashboardLayout>
          <Orders />
        </DashboardLayout>
      )} />
      
      <Route path="/orders/new" component={() => (
        <DashboardLayout>
          <NewOrder />
        </DashboardLayout>
      )} />
      
      <Route path="/orders/:id">
        {(params) => (
          <DashboardLayout>
            <OrderDetails id={Number(params.id)} />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
