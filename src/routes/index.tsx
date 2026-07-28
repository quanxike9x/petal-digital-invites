import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AdminRoute } from '../components/auth/AdminRoute';
import { PageLoadingFallback } from '../components/common/SkeletonLoaders';

// Lazy Loaded Pages for Optimal Production Performance & Code Splitting
const LandingPage = lazy(() => import('../pages/landing/LandingPage').then((m) => ({ default: m.LandingPage })));
const AuthCallback = lazy(() => import('../pages/auth/AuthCallback').then((m) => ({ default: m.AuthCallback })));
const Login = lazy(() => import('../pages/auth/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('../pages/auth/Register').then((m) => ({ default: m.Register })));
const PublicWeddingPage = lazy(() => import('../pages/public/PublicWeddingPage').then((m) => ({ default: m.PublicWeddingPage })));

// User Pages
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard').then((m) => ({ default: m.Dashboard })));
const MyInvitations = lazy(() => import('../pages/invitations/MyInvitations').then((m) => ({ default: m.MyInvitations })));
const TemplateGallery = lazy(() => import('../pages/templates/TemplateGallery').then((m) => ({ default: m.TemplateGallery })));
const Guests = lazy(() => import('../pages/guests/Guests').then((m) => ({ default: m.Guests })));
const InvitationAnalytics = lazy(() => import('../pages/analytics/InvitationAnalytics').then((m) => ({ default: m.InvitationAnalytics })));
const Domains = lazy(() => import('../pages/domains/Domains').then((m) => ({ default: m.Domains })));
const Payments = lazy(() => import('../pages/payments/Payments').then((m) => ({ default: m.Payments })));
const Settings = lazy(() => import('../pages/settings/Settings').then((m) => ({ default: m.Settings })));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers').then((m) => ({ default: m.AdminUsers })));
const AdminTemplates = lazy(() => import('../pages/admin/AdminTemplates').then((m) => ({ default: m.AdminTemplates })));
const AdminPayments = lazy(() => import('../pages/admin/AdminPayments').then((m) => ({ default: m.AdminPayments })));
const AdminDomains = lazy(() => import('../pages/admin/AdminDomains').then((m) => ({ default: m.AdminDomains })));
const AdminAnalytics = lazy(() => import('../pages/admin/AdminAnalytics').then((m) => ({ default: m.AdminAnalytics })));
const AdminStorage = lazy(() => import('../pages/admin/AdminStorage').then((m) => ({ default: m.AdminStorage })));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings').then((m) => ({ default: m.AdminSettings })));

// Editors & Error Pages
const CustomerInvitationEditor = lazy(() => import('../pages/editors/CustomerInvitationEditor').then((m) => ({ default: m.CustomerInvitationEditor })));
const AdminTemplateEditor = lazy(() => import('../pages/editors/AdminTemplateEditor').then((m) => ({ default: m.AdminTemplateEditor })));
const NotFoundPage = lazy(() => import('../pages/errors/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const ForbiddenPage = lazy(() => import('../pages/errors/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage })));

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoadingFallback />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(LandingPage),
  },
  {
    path: '/w/:slug',
    element: withSuspense(PublicWeddingPage),
  },
  {
    path: '/w/:slug/:guest_slug',
    element: withSuspense(PublicWeddingPage),
  },
  {
    path: '/i/:slug',
    element: withSuspense(PublicWeddingPage),
  },
  {
    path: '/i/:slug/:guest_slug',
    element: withSuspense(PublicWeddingPage),
  },
  {
    path: '/auth/callback',
    element: withSuspense(AuthCallback),
  },
  {
    path: '/login',
    element: withSuspense(Login),
  },
  {
    path: '/register',
    element: withSuspense(Register),
  },
  {
    path: '/403',
    element: withSuspense(ForbiddenPage),
  },
  {
    path: '/404',
    element: withSuspense(NotFoundPage),
  },

  // Admin SaaS Portal Routes
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: '/admin',
            element: withSuspense(AdminDashboard),
          },
          {
            path: '/admin/users',
            element: withSuspense(AdminUsers),
          },
          {
            path: '/admin/templates',
            element: withSuspense(AdminTemplates),
          },
          {
            path: '/admin/payments',
            element: withSuspense(AdminPayments),
          },
          {
            path: '/admin/domains',
            element: withSuspense(AdminDomains),
          },
          {
            path: '/admin/analytics',
            element: withSuspense(AdminAnalytics),
          },
          {
            path: '/admin/storage',
            element: withSuspense(AdminStorage),
          },
          {
            path: '/admin/settings',
            element: withSuspense(AdminSettings),
          },
        ],
      },
      {
        path: '/editor/admin/:id',
        element: withSuspense(AdminTemplateEditor),
      },
    ],
  },

  // User Workspace Routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/dashboard',
            element: withSuspense(Dashboard),
          },
          {
            path: '/invitations',
            element: withSuspense(MyInvitations),
          },
          {
            path: '/templates',
            element: withSuspense(TemplateGallery),
          },
          {
            path: '/guests',
            element: withSuspense(Guests),
          },
          {
            path: '/analytics',
            element: withSuspense(InvitationAnalytics),
          },
          {
            path: '/domains',
            element: withSuspense(Domains),
          },
          {
            path: '/payments',
            element: withSuspense(Payments),
          },
          {
            path: '/settings',
            element: withSuspense(Settings),
          },
        ],
      },
      {
        path: '/editor/customer/:id',
        element: withSuspense(CustomerInvitationEditor),
      },
      {
        path: '/editor/:id',
        element: withSuspense(CustomerInvitationEditor),
      },
    ],
  },
  {
    path: '*',
    element: withSuspense(NotFoundPage),
  },
]);
