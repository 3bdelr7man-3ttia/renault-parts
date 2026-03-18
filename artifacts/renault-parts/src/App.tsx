import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/lib/auth-context";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import Home from "@/pages/Home";
import Packages from "@/pages/Packages";
import PackageDetail from "@/pages/PackageDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Checkout from "@/pages/Checkout";
import MyOrders from "@/pages/MyOrders";
import OrderDetail from "@/pages/OrderDetail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/packages" component={Packages} />
        <Route path="/packages/:slug" component={PackageDetail} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/checkout/:id" component={Checkout} />
        <Route path="/my-orders" component={MyOrders} />
        <Route path="/orders/:id" component={OrderDetail} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  // Enforce RTL
  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
