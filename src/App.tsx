import React from "react";
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
import { CreateService } from "./pages/Creator/CreateService";
import { ManageShop } from "./pages/Creator/ManageShop";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  },
});

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
          </CartProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}
