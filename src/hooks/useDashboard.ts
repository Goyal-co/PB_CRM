import { useState, useEffect } from 'react';
import { dashboardService, type DashboardKPIs, type UserSummary } from '../services/dashboardService';
import { bookingService, type Booking } from '../services/bookingService';
import { paymentService, type Payment } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';

const toBookingArray = (res: unknown): Booking[] =>
  Array.isArray(res) ? res : ((res as { data?: Booking[] })?.data ?? []);

export const useDashboard = () => {
  const { currentUser } = useAuth();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [userSummary, setUserSummary] = useState<UserSummary | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'super_admin';
  const isManager = currentUser?.role === 'manager';
  const isUser = currentUser?.role === 'user';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching dashboard data for role:', currentUser?.role);

        if (isAdmin || isManager) {
          // Fetch KPIs for admin/manager
          console.log('Fetching admin/manager dashboard data...');
          
          try {
            const kpisData = await dashboardService.getKPIs();
            console.log('KPIs data:', kpisData);
            setKpis(kpisData);
          } catch (kpiError) {
            console.error('Failed to fetch KPIs:', kpiError);
            setKpis(null);
          }

          try {
            // Workspace = bookings in projects assigned to this manager token only.
            // Super admins often have no workspace rows, so they would see an empty list
            // even when users have submitted bookings. Use the global list for super_admin.
            const bookingsData = isAdmin
              ? await bookingService.getAll({ limit: 5 })
              : await bookingService.getWorkspace({ limit: 5 });
            const list = toBookingArray(bookingsData);
            console.log('Recent bookings:', isAdmin ? '(getAll)' : '(workspace)', list);
            setRecentBookings(list);
          } catch (bookingError) {
            console.error('Failed to fetch bookings:', bookingError);
            setRecentBookings([]);
          }

          try {
            const paymentsData = await paymentService.getAll({ limit: 5 });
            console.log('Recent payments:', paymentsData);
            setRecentPayments(Array.isArray(paymentsData) ? paymentsData : []);
          } catch (paymentError) {
            console.error('Failed to fetch payments:', paymentError);
            setRecentPayments([]);
          }
        } else if (isUser) {
          // Fetch user-specific data
          console.log('Fetching user dashboard data...');
          
          try {
            const summaryData = await dashboardService.getMySummary();
            console.log('User summary:', summaryData);
            setUserSummary(summaryData);
          } catch (summaryError) {
            console.error('Failed to fetch user summary:', summaryError);
            setUserSummary(null);
          }

          try {
            const bookingsData = await bookingService.getAll({ limit: 5 });
            const list = toBookingArray(bookingsData);
            console.log('User bookings (getAll):', list);
            setRecentBookings(list);
          } catch (bookingError) {
            console.error('Failed to fetch user bookings:', bookingError);
            setRecentBookings([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser, isAdmin, isManager, isUser]);

  return {
    kpis,
    userSummary,
    recentBookings,
    recentPayments,
    loading,
    error,
    isAdmin,
    isManager,
    isUser,
  };
};
