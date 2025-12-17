import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LandingPage } from "./components/LandingPage";
import { RegisterPage } from "./components/RegisterPage";
import { LoginPage } from "./components/LoginPage";
import { CustomerDashboard } from "./components/customer/CustomerDashboard";
import { CreateOrder } from "./components/customer/CreateOrder";
import { LaundryStatus } from "./components/customer/LaundryStatus";
import { TransactionHistory } from "./components/customer/TransactionHistory";
import { Payment } from "./components/customer/Payment";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { CustomerManagement } from "./components/admin/CustomerManagement";
import { PackageManagement } from "./components/admin/PackageManagement";
import { OrderManagement } from "./components/admin/OrderManagement";
import { Reports } from "./components/admin/Reports";
import { Toaster } from "./components/ui/sonner";

function PrivateRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "pelanggan" | "admin";
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Customer Routes */}
      <Route
        path="/customer/dashboard"
        element={
          <PrivateRoute role="pelanggan">
            <CustomerDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/customer/create-order"
        element={
          <PrivateRoute role="pelanggan">
            <CreateOrder />
          </PrivateRoute>
        }
      />
      <Route
        path="/customer/laundry-status"
        element={
          <PrivateRoute role="pelanggan">
            <LaundryStatus />
          </PrivateRoute>
        }
      />
      <Route
        path="/customer/transaction-history"
        element={
          <PrivateRoute role="pelanggan">
            <TransactionHistory />
          </PrivateRoute>
        }
      />
      <Route
        path="/customer/payment"
        element={
          <PrivateRoute role="pelanggan">
            <Payment />
          </PrivateRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute role="admin">
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <PrivateRoute role="admin">
            <CustomerManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <PrivateRoute role="admin">
            <OrderManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/packages"
        element={
          <PrivateRoute role="admin">
            <PackageManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <PrivateRoute role="admin">
            <Reports />
          </PrivateRoute>
        }
      />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}