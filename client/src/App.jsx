import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import OrderReview from './pages/OrderReview.jsx';
import TrackOrder from './pages/TrackOrder.jsx';
import Account from './pages/Account.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import Dashboard from './admin/Dashboard.jsx';
import AdminProducts from './admin/AdminProducts.jsx';
import AdminOrders from './admin/AdminOrders.jsx';
import AdminStock from './admin/AdminStock.jsx';
import AdminCustomers from './admin/AdminCustomers.jsx';
import AdminCoupons from './admin/AdminCoupons.jsx';
import AdminExpenses from './admin/AdminExpenses.jsx';
import AdminLanding from './admin/AdminLanding.jsx';
import AdminStaff from './admin/AdminStaff.jsx';
import AdminReports from './admin/AdminReports.jsx';
import AdminSecurity from './admin/AdminSecurity.jsx';
import AdminMenu from './admin/AdminMenu.jsx';
import AdminNotifications from './admin/AdminNotifications.jsx';
import AdminActivityLog from './admin/AdminActivityLog.jsx';
import AdminWebsite from './admin/AdminWebsite.jsx';
import AdminImageRules from './admin/AdminImageRules.jsx';
import AdminPixelStats from './admin/AdminPixelStats.jsx';
import AdminMetaCatalog from './admin/AdminMetaCatalog.jsx';
import AdminMailbox from './admin/AdminMailbox.jsx';
import AdminSettings from './admin/AdminSettings.jsx';
import AdminServerStats from './admin/AdminServerStats.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ComingSoon from './admin/ComingSoon.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="cart" element={<Navigate to="/checkout" replace />} />
        <Route path="order-success/:number" element={<OrderSuccess />} />
        <Route path="review/:token" element={<OrderReview />} />
        <Route path="track" element={<TrackOrder />} />
        <Route path="account" element={<Account />} />
        <Route path="contact" element={<Contact />} />
        <Route path="lp/:slug" element={<LandingPage />} />
      </Route>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="sales" element={<AdminOrders />} />
        <Route path="stock" element={<AdminStock />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="expenses" element={<AdminExpenses />} />
        <Route path="landing-pages" element={<AdminLanding />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="fraud-checker" element={<AdminSecurity initial="lookup" />} />
        <Route path="ip-block" element={<AdminSecurity initial="blocklist" />} />
        <Route path="menu-builder" element={<AdminMenu />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="activity-log" element={<AdminActivityLog />} />
        <Route path="website" element={<AdminWebsite />} />
        <Route path="image-rules" element={<AdminImageRules />} />
        <Route path="pixel-stats" element={<AdminPixelStats />} />
        <Route path="meta-catalog" element={<AdminMetaCatalog />} />
        <Route path="support-mailbox" element={<AdminMailbox title="Support Mailbox" />} />
        <Route path="contact-queries" element={<AdminMailbox source="contact" title="Contact Form Queries" />} />
        <Route path="configurations" element={<AdminSettings />} />
        <Route path="server-stats" element={<AdminServerStats />} />
        <Route path=":slug" element={<ComingSoon />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
