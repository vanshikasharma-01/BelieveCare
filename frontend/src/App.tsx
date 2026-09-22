import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SeniorModeContext } from "./context/SeniorModeContext";
import CookieConsent from "./components/CookieConsent";
import Footer from "./components/Footer";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import Addresses from "./pages/Addresses";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import FirstAidKit from "./pages/FirstAidKit";
import OrderHistory from "./pages/OrderHistory";
import ProductDetails from "./pages/ProductDetails";
import OwnerDashboard from "./pages/OwnerDashboard";
import Signup from "./pages/Signup";
import Settings from "./pages/Settings";
import ExpiryAlerts from "./pages/ExpiryAlerts";
import InventoryDashboard from "./pages/InventoryDashboard";
import LowStockDashboard from "./pages/LowStockDashboard";
import OwnerOrders from "./pages/OwnerOrders";
import OwnerFeedback from "./pages/OwnerFeedback";
import ScanBarcode from "./pages/ScanBarcode";
import Medicines from "./pages/medicine";
import AdminDashboard from "./pages/OwnerDashboard";
import AddMedicine from "./pages/addMedicine";
import CategoryPicker from "./pages/manualAdd/CategoryPicker";
import AddMedicineManual from "./pages/manualAdd/AddMedicineManual";
import AddWellnessManual from "./pages/manualAdd/AddWellnessManual";
import AddCosmeticsManual from "./pages/manualAdd/AddCosmeticsManual";
import AddToolsManual from "./pages/manualAdd/AddToolsManual";
import FAQ from "./pages/FAQ";
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";
import TermsAndConditions from "./pages/TermsAndConditions";
import NotFound from "./pages/NotFound";
import BarcodeProvider from "./context/barcodeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatbotGate from "./components/chatbot/ChatbotGate";

const OWNER_ROLES = ["Owner", "IT Staff"];
const CUSTOMER_ROLES = ["Customer"];

function App() {

  const { seniorMode } = useContext(SeniorModeContext);

  return (
<BarcodeProvider>
    <BrowserRouter>

      {/* Applying the "senior" class here (rather than per-page) means
          Senior Mode affects every page of the customer dashboard, and
          — since SeniorModeContext lives above the router — the setting
          is remembered as the customer navigates between pages. */}
      <div className={seniorMode ? "senior" : ""}>

      <Routes>


        {/* Login */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={OWNER_ROLES}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
  <Route
  path="/add-medicine"
  element={
    <ProtectedRoute allowedRoles={OWNER_ROLES}>
      <AddMedicine />
    </ProtectedRoute>
  }
/>
  <Route
  path="/add-medicine-manual"
  element={
    <ProtectedRoute allowedRoles={OWNER_ROLES}>
      <CategoryPicker />
    </ProtectedRoute>
  }
/>
  <Route
  path="/add-medicine-manual/medicine"
  element={
    <ProtectedRoute allowedRoles={OWNER_ROLES}>
      <AddMedicineManual />
    </ProtectedRoute>
  }
/>
  <Route
  path="/add-medicine-manual/wellness"
  element={
    <ProtectedRoute allowedRoles={OWNER_ROLES}>
      <AddWellnessManual />
    </ProtectedRoute>
  }
/>
  <Route
  path="/add-medicine-manual/cosmetics"
  element={
    <ProtectedRoute allowedRoles={OWNER_ROLES}>
      <AddCosmeticsManual />
    </ProtectedRoute>
  }
/>
  <Route
  path="/add-medicine-manual/tools"
  element={
    <ProtectedRoute allowedRoles={OWNER_ROLES}>
      <AddToolsManual />
    </ProtectedRoute>
  }
/>
        {/* Signup */}

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />
        
        {/* Customer Pages */}

        <Route
          path="/home"
          element={<Home />}
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={CUSTOMER_ROLES}>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={<Cart />}
        />


        <Route
          path="/wishlist"
          element={<Wishlist />}
        />


        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={CUSTOMER_ROLES}>
              <Profile />
            </ProtectedRoute>
          }
        />


        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={CUSTOMER_ROLES}>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/scan-barcode"
          element={
            <ProtectedRoute allowedRoles={OWNER_ROLES}>
              <ScanBarcode />
            </ProtectedRoute>
          }
        />


        <Route
          path="/addresses"
          element={
            <ProtectedRoute allowedRoles={CUSTOMER_ROLES}>
              <Addresses />
            </ProtectedRoute>
          }
        />



        {/* First Aid Kit */}


        <Route
          path="/first-aid"
          element={<FirstAidKit />}
        />



        {/* Orders */}


        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={CUSTOMER_ROLES}>
              <OrderHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/medicines"
          element={<Medicines />}
        />

        <Route
          path="/faq"
          element={<FAQ />}
        />

        <Route
          path="/contact-us"
          element={<ContactUs />}
        />

        <Route
          path="/about-us"
          element={<AboutUs />}
        />

        <Route
          path="/terms-and-conditions"
          element={<TermsAndConditions />}
        />

        <Route
          path="/payment-success"
          element={<PaymentSuccess />}
        />



        {/* Product Details */}


        <Route
          path="/medicine/:id"
          element={<ProductDetails />}
        />

        {/* Owner Dashboard */}

        <Route
          path="/owner-dashboard"
          element={
            <ProtectedRoute allowedRoles={OWNER_ROLES}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory-dashboard"
          element={
            <ProtectedRoute allowedRoles={OWNER_ROLES}>
              <InventoryDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/billing-dashboard"
          element={<Navigate to="/owner/orders" replace />}
        />

        <Route
          path="/low-stock-dashboard"
          element={
            <ProtectedRoute allowedRoles={OWNER_ROLES}>
              <LowStockDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/expiry-alerts"
          element={
            <ProtectedRoute allowedRoles={OWNER_ROLES}>
              <ExpiryAlerts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/orders"
          element={
            <ProtectedRoute allowedRoles={OWNER_ROLES}>
              <OwnerOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/feedback"
          element={
            <ProtectedRoute allowedRoles={OWNER_ROLES}>
              <OwnerFeedback />
            </ProtectedRoute>
          }
        />

        {/* Catch-all: any URL that doesn't match a real route above */}
        <Route path="*" element={<NotFound />} />

      </Routes>
      <ChatbotGate/>
          

      <Footer />

      <CookieConsent />

      </div>

    </BrowserRouter>
    </BarcodeProvider>

  );

}


export default App;