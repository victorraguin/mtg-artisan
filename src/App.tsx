import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { Layout } from "./components/Layout/Layout";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";

// Pages
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";
import { ProductDetail } from "./pages/ProductDetail";
import { ServiceDetail } from "./pages/ServiceDetail";
import { CreatorProfile } from "./pages/CreatorProfile";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { SignIn } from "./pages/Auth/SignIn";
import { SignUp } from "./pages/Auth/SignUp";
import { Profile } from "./pages/Profile";

// Dashboard pages
import { BuyerDashboard } from "./pages/Dashboard/BuyerDashboard";
import { CreatorDashboard } from "./pages/Dashboard/CreatorDashboard";
import { AdminDashboard } from "./pages/Admin/AdminDashboard";

// Creator pages
import { CreateProduct } from "./pages/Creator/CreateProduct";
import { EditProduct } from "./pages/Creator/EditProduct";
import { CreateService } from "./pages/Creator/CreateService";
import { ManageShop } from "./pages/Creator/ManageShop";

// Notification pages
import { NotificationPreferences } from "./pages/NotificationPreferences";
import { NotificationTest } from "./pages/NotificationTest";

// Debug components
import { QuickNotificationTest } from "./components/Debug/QuickNotificationTest";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes - évite les refetch inutiles
      gcTime: 10 * 60 * 1000, // 10 minutes - garde en cache plus longtemps
    },
  },
});

// Expose queryClient globally for services
(window as any).queryClient = queryClient;

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <CartProvider>
            <Layout>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/service/:id" element={<ServiceDetail />} />
                <Route path="/creator/:slug" element={<CreatorProfile />} />

                {/* Auth routes */}
                <Route path="/auth/signin" element={<SignIn />} />
                <Route path="/auth/signup" element={<SignUp />} />

                {/* Protected routes */}
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Dashboard routes */}
                <Route
                  path="/dashboard/buyer"
                  element={
                    <ProtectedRoute>
                      <BuyerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Creator routes */}
                <Route
                  path="/dashboard/creator"
                  element={
                    <ProtectedRoute requiredRole="creator">
                      <CreatorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/creator/products/new"
                  element={
                    <ProtectedRoute requiredRole="creator">
                      <CreateProduct />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/creator/products/:productId/edit"
                  element={
                    <ProtectedRoute requiredRole="creator">
                      <EditProduct />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/creator/services/new"
                  element={
                    <ProtectedRoute requiredRole="creator">
                      <CreateService />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/creator/shop"
                  element={
                    <ProtectedRoute requiredRole="creator">
                      <ManageShop />
                    </ProtectedRoute>
                  }
                />

                {/* Admin routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Notification routes */}
                <Route
                  path="/notifications/preferences"
                  element={
                    <ProtectedRoute>
                      <NotificationPreferences />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications/test"
                  element={
                    <ProtectedRoute>
                      <NotificationTest />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Layout>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#1f2937",
                  color: "#fff",
                  border: "1px solid #374151",
                },
              }}
            />
            {/* Composant de debug pour surveiller l'état de l'authentification */}
            <QuickNotificationTest />
          </CartProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}
