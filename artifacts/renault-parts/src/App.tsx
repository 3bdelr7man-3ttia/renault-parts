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
import EmployeeDashboardPage from "@/pages/admin/employee/dashboard/page";
import EmployeeCustomersPage from "@/pages/admin/employee/customers/page";
import EmployeeWorkshopsPage from "@/pages/admin/employee/workshops/page";
import EmployeeTasksPage from "@/pages/admin/employee/tasks/page";
import EmployeeTeamPage from "@/pages/admin/employee/team/page";
import EmployeeDataEntryPage from "@/pages/admin/employee/data-entry/page";
import EmployeeReportsPage from "@/pages/admin/employee/reports/page";
import EmployeeTechnicalPage from "@/pages/admin/employee/technical/page";
import { evaluateRouteAccess } from "../middleware";

// Workshop Portal Pages
import WorkshopDashboard from "@/pages/workshop/WorkshopDashboard";
import WorkshopAppointments from "@/pages/workshop/WorkshopAppointments";
import WorkshopSchedule from "@/pages/workshop/WorkshopSchedule";
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

class RouteErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Route rendering error", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", background: "#0D1220", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 420, textAlign: "center", fontFamily: "'Almarai',sans-serif" }}>
            <div style={{ width: 52, height: 52, margin: "0 auto 16px", borderRadius: 18, background: "rgba(239,68,68,0.12)", border: "1.5px solid rgba(239,68,68,0.24)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FCA5A5", fontSize: 26, fontWeight: 900 }}>
              !
            </div>
            <div style={{ color: "#E8F0F8", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>حدث خطأ في عرض الصفحة</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.9 }}>
              أعد تحميل الصفحة مرة أخرى. وإذا استمرت المشكلة فسيظهر لنا الخطأ بدل الصفحة الفارغة لتسهيل إصلاحه.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const access = evaluateRouteAccess(location, user);

  useEffect(() => {
    if (!isLoading && !access.allowed && access.redirectTo) {
      setLocation(access.redirectTo);
    }
  }, [access.allowed, access.redirectTo, isLoading, setLocation]);

  if (isLoading && !user) return <LoadingScreen />;
  if (!access.allowed) return access.redirectTo ? <LoadingScreen /> : <AccessDenied />;
  return <>{children}</>;
}

const LoadingScreen = () => (
  <div style={{ minHeight: '100vh', background: '#0D1220', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center', fontFamily: "'Almarai',sans-serif" }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(200,151,74,0.2)', borderTopColor: '#C8974A', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
      <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>جارٍ التحقق من الصلاحيات...</div>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function WorkshopGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isFetching } = useAuth();
  const [location, setLocation] = useLocation();
  const access = evaluateRouteAccess(location, user);

  useEffect(() => {
    if (!isLoading && !access.allowed && access.redirectTo) {
      setLocation(access.redirectTo);
    }
  }, [access.allowed, access.redirectTo, isLoading, setLocation]);

  if ((isLoading && !user) || (isFetching && !user)) return <LoadingScreen />;
  if (!access.allowed) return access.redirectTo ? <LoadingScreen /> : <AccessDenied />;
  return <>{children}</>;
}

function Router() {
  const [location] = useLocation();
  const isAdmin = location.startsWith('/admin');
  const isWorkshop = location === '/workshop' || location.startsWith('/workshop/');

  if (isAdmin) {
    return (
      <AdminGuard>
        <RouteErrorBoundary>
          <AdminLayout>
            <Switch>
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/dashboard" component={AdminDashboard} />
              <Route path="/admin/employee/dashboard" component={EmployeeDashboardPage} />
              <Route path="/admin/employee/customers" component={EmployeeCustomersPage} />
              <Route path="/admin/employee/workshops" component={EmployeeWorkshopsPage} />
              <Route path="/admin/employee/technical" component={EmployeeTechnicalPage} />
              <Route path="/admin/employee/tasks" component={EmployeeTasksPage} />
              <Route path="/admin/employee/data-entry" component={EmployeeDataEntryPage} />
              <Route path="/admin/employee/reports" component={EmployeeReportsPage} />
              <Route path="/admin/employee/team" component={EmployeeTeamPage} />
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
        </RouteErrorBoundary>
      </AdminGuard>
    );
  }

  if (isWorkshop) {
    return (
      <WorkshopGuard>
        <RouteErrorBoundary>
          <WorkshopLayout>
            <Switch>
              <Route path="/workshop" component={WorkshopDashboard} />
              <Route path="/workshop/appointments" component={WorkshopAppointments} />
              <Route path="/workshop/schedule" component={WorkshopSchedule} />
              <Route path="/workshop/orders" component={WorkshopOrders} />
              <Route path="/workshop/earnings" component={WorkshopEarnings} />
              <Route path="/workshop/pricing" component={WorkshopPricing} />
              <Route component={NotFound} />
            </Switch>
          </WorkshopLayout>
        </RouteErrorBoundary>
      </WorkshopGuard>
    );
  }

  return (
    <RouteErrorBoundary>
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
    </RouteErrorBoundary>
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
