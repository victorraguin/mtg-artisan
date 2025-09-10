import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WalletProvider } from "./contexts/WalletContext";
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
import { Wallet } from "./pages/Wallet";
import { Orders } from "./pages/Orders";

// Dashboard pages
import { BuyerDashboard } from "./pages/Dashboard/BuyerDashboard";
import { CreatorDashboard } from "./pages/Dashboard/CreatorDashboard";
import { AdminDashboard } from "./pages/Admin/AdminDashboardNew";
import CommissionsConfig from "./pages/Admin/CommissionsConfig";
import AmbassadorsConfig from "./pages/Admin/AmbassadorsConfig";
import { AmbassadorDashboard } from "./pages/Ambassador/AmbassadorDashboard";
import { AmbassadorDemo } from "./components/Demo";

// Creator pages
import { CreateProduct } from "./pages/Creator/CreateProduct";
import { EditProduct } from "./pages/Creator/EditProduct";
import { CreateService } from "./pages/Creator/CreateService";
import { ManageShop } from "./pages/Creator/ManageShop";
import { CreatorProgram } from "./pages/Creator/CreatorProgram";
import { OnboardingPage } from "./pages/Creator/OnboardingPage";
import { OrdersManagement } from "./pages/Creator/OrdersManagement";
import { DisputesManagement } from "./pages/Creator/DisputesManagement";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <WalletProvider>
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
                  <Route
                    path="/wallet"
                    element={
                      <ProtectedRoute>
                        <Wallet />
                      </ProtectedRoute>
                    }
                  />

                  {/* Orders route */}
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />

                  {/* Legacy route redirect */}
                  <Route
                    path="/dashboard/buyer"
                    element={<Navigate to="/orders" replace />}
                  />
                  <Route
                    path="/ambassador"
                    element={
                      <ProtectedRoute>
                        <AmbassadorDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/demo/ambassador"
                    element={
                      <ProtectedRoute>
                        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                          <AmbassadorDemo />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/creator-program"
                    element={
                      <ProtectedRoute>
                        <CreatorProgram />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/creator/onboarding"
                    element={
                      <ProtectedRoute requiredRole="creator">
                        <OnboardingPage />
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
                  <Route
                    path="/creator/orders"
                    element={
                      <ProtectedRoute requiredRole="creator">
                        <OrdersManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/creator/disputes"
                    element={
                      <ProtectedRoute requiredRole="creator">
                        <DisputesManagement />
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
                  <Route
                    path="/admin/commissions"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <CommissionsConfig />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/ambassadors"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AmbassadorsConfig />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
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
              </Layout>
            </CartProvider>
          </WalletProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}
