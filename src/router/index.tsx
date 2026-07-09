import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Skeleton } from '../components/ui/Skeleton';

const MainDashboard = lazy(() => import('../pages/MainDashboard'));
const LiveMonitor = lazy(() => import('../pages/LiveMonitor'));
const FenceEditor = lazy(() => import('../pages/FenceEditor'));
const EventReplay = lazy(() => import('../pages/EventReplay'));
const LogCenter = lazy(() => import('../pages/LogCenter'));
const ReportDetail = lazy(() => import('../pages/ReportDetail'));
const UserManagement = lazy(() => import('../pages/UserManagement'));
const CharacterManagement = lazy(() => import('../pages/CharacterManagement'));
const DeviceInfo = lazy(() => import('../pages/DeviceInfo'));
const ExceptionSettings = lazy(() => import('../pages/ExceptionSettings'));
const WeeklyReportDetail = lazy(() => import('../pages/WeeklyReportDetail'));

function PageFallback() {
  return (
    <div style={{ padding: 'var(--space-6)' }}>
      <Skeleton variant="card" count={3} />
    </div>
  );
}

function LazyPage({ Component }: { Component: React.LazyExoticComponent<() => JSX.Element> }) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Navigate to="/main" replace /> },
      { path: '/main', element: <LazyPage Component={MainDashboard} /> },
      { path: '/view', element: <Navigate to="/main" replace /> },
      { path: '/view/:cameraId', element: <LazyPage Component={LiveMonitor} /> },
      { path: '/view/:viewId/edit', element: <LazyPage Component={FenceEditor} /> },
      { path: '/replay', element: <Navigate to="/main" replace /> },
      { path: '/replay/:eventId', element: <LazyPage Component={EventReplay} /> },
      { path: '/log', element: <LazyPage Component={LogCenter} /> },
      { path: '/report', element: <Navigate to="/log" replace /> },
      { path: '/report/:date', element: <LazyPage Component={ReportDetail} /> },
      { path: '/weekly-report', element: <Navigate to="/log" replace /> },
      { path: '/weekly-report/:weekNum', element: <LazyPage Component={WeeklyReportDetail} /> },
      { path: '/users', element: <LazyPage Component={UserManagement} /> },
      { path: '/characters', element: <LazyPage Component={CharacterManagement} /> },
      { path: '/equipment', element: <LazyPage Component={DeviceInfo} /> },
      { path: '/exception-settings', element: <LazyPage Component={ExceptionSettings} /> },
    ],
  },
]);
