import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Units from './pages/Units';
import Users from './pages/Users';
import GetBackendIds from './pages/GetBackendIds';
import BookingForm from './pages/BookingForm';
import MyBookings from './pages/MyBookings';
import NewBookings from './pages/NewBookings';
import Agreements from './pages/Agreements';
import Customers from './pages/Customers';
import ConstructionUpdates from './pages/ConstructionUpdates';
import PaymentRequests from './pages/PaymentRequests';
import PaymentTracking from './pages/PaymentTracking';
import Templates from './pages/Templates';
import Settings from './pages/Settings';

const ProtectedLayout: React.FC = () => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <AppLayout />;
};

const PublicLogin: React.FC = () => {
  const { currentUser } = useAuth();
  if (currentUser) return <Navigate to="/" replace />;
  return <Login />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicLogin />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/units" element={<Units />} />
        <Route path="/users" element={<Users />} />
        <Route path="/get-ids" element={<GetBackendIds />} />
        <Route path="/booking-form" element={<BookingForm />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/bookings" element={<NewBookings />} />
        <Route path="/agreements" element={<Agreements />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/construction" element={<ConstructionUpdates />} />
        <Route path="/payment-requests" element={<PaymentRequests />} />
        <Route path="/payment-tracking" element={<PaymentTracking />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
