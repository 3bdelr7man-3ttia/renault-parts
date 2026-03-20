import React, { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { CarProvider } from "@/lib/car-context";
import { PartCartProvider } from "@/lib/part-cart-context";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { WorkshopLayout } from "@/components/layout/WorkshopLayout";
import ChatWidget from "@/components/ChatWidget";

// Pages
import Home from "@/pages/Home";
import Packages from "@/pages/Packages";
import PackageDetail from "@/pages/PackageDetail";
import Parts from "@/pages/Parts";
import Workshops from "@/pages/Workshops";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Checkout from "@/pages/Checkout";
import MyOrders from "@/pages/MyOrders";
import Profile from "@/pages/Profile";
import OrderDetail from "@/pages/OrderDetail";
import PaymentResult from "@/pages/PaymentResult";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminPackages from "@/pages/admin/AdminPackages";
import AdminWorkshops from "@/pages/admin/AdminWorkshops";
import AdminParts from "@/pages/admin/AdminParts";
import AdminReviews from "@/pages/admin/AdminReviews";
import AdminSales from "@/pages/admin/AdminSales";
import AdminExpenses from "@/pages/admin/AdminExpenses";
import AdminWorkshopApplications from "@/pages/admin/AdminWorkshopApplications";
import AdminAppointments from "@/pages/admin/AdminAppointments";
import AccessDenied from "@/pages/AccessDenied";
import JoinWorkshop from "@/pages/JoinWorkshop";

// Workshop Portal Pages
import WorkshopDashboard from "@/pages/workshop/WorkshopDashboard";
import WorkshopAppointments from "@/pages/workshop/WorkshopAppointments";
import WorkshopOrders from "@/pages/workshop/WorkshopOrders";
import WorkshopEarnings from "@/pages/workshop/WorkshopEarnings";
import WorkshopPricing from "@/pages/workshop/WorkshopPricing";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  if (isLoading) return null;
  if (!user) { setLocation('/login'); return null; }
  if (user.role !== 'admin') { return <AccessDenied />; }
  return <>{children}</>;
}

function WorkshopGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  if (isLoading) return null;
  if (!user) { setLocation('/login'); return null; }
  if (user.role === 'admin') { setLocation('/admin'); return null; }
  if (user.role !== 'workshop') { return <AccessDenied />; }
  return <>{children}</>;
}

function Router() {
  const [location] = useLocation();
  const isAdmin = location.startsWith('/admin');
  const isWorkshop = location === '/workshop' || location.startsWith('/workshop/');

  if (isAdmin) {
    return (
      <AdminGuard>
        <AdminLayout>
          <Switch>
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/dashboard" component={AdminDashboard} />
            <Route path="/admin/orders" component={AdminOrders} />
            <Route path="/admin/packages" component={AdminPackages} />
            <Route path="/admin/workshops" component={AdminWorkshops} />
            <Route path="/admin/parts" component={AdminParts} />
            <Route path="/admin/reviews" component={AdminReviews} />
            <Route path="/admin/sales" component={AdminSales} />
            <Route path="/admin/expenses" component={AdminExpenses} />
            <Route path="/admin/users" component={AdminUsers} />
            <Route path="/admin/workshop-applications" component={AdminWorkshopApplications} />
            <Route path="/admin/appointments" component={AdminAppointments} />
            <Route component={NotFound} />
          </Switch>
        </AdminLayout>
      </AdminGuard>
    );
  }

  if (isWorkshop) {
    return (
      <WorkshopGuard>
        <WorkshopLayout>
          <Switch>
            <Route path="/workshop" component={WorkshopDashboard} />
            <Route path="/workshop/appointments" component={WorkshopAppointments} />
            <Route path="/workshop/orders" component={WorkshopOrders} />
            <Route path="/workshop/earnings" component={WorkshopEarnings} />
            <Route path="/workshop/pricing" component={WorkshopPricing} />
            <Route component={NotFound} />
          </Switch>
        </WorkshopLayout>
      </WorkshopGuard>
    );
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/packages" component={Packages} />
        <Route path="/packages/:slug" component={PackageDetail} />
        <Route path="/parts" component={Parts} />
        <Route path="/workshops" component={Workshops} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/checkout/:id" component={Checkout} />
        <Route path="/my-orders" component={MyOrders} />
        <Route path="/profile" component={Profile} />
        <Route path="/orders/:id" component={OrderDetail} />
        <Route path="/payment/result" component={PaymentResult} />
        <Route path="/join-workshop" component={JoinWorkshop} />
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
            <PartCartProvider>
              <CarProvider>
                <Router />
                <ChatWidget />
              </CarProvider>
            </PartCartProvider>
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
