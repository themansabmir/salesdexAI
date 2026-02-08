import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { ROUTES } from "./routes.config";
import { ProtectedLayout } from "./layout/ProtectedLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "@/features/auth/presentation/pages/login-page";
import { RegisterPage } from "@/features/auth/presentation/pages/register-page";
import { OrganizationCreatePage } from "@/features/organization/presentation/pages/org-create-page";
import { OrganizationSettingsPage } from "@/features/organization/presentation/pages/org-settings-page";
import { SuperadminDashboardPage } from "@/features/system/presentation/pages/superadmin-dashboard-page";

// Placeholder Components
const DashboardPage = () => <div>Dashboard Home</div>;
const UsersPage = () => <div>Users Page</div>;
const AdminsPage = () => <div>Admins Page</div>;
const StudentsPage = () => <div>Students Page</div>;

export function AppRouter() {
    return <RouterProvider router={router} />;
}

const router = createBrowserRouter([
    {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
    },
    {
        path: "/register",
        element: <RegisterPage />,
    },
    {
        path: ROUTES.ORGANIZATION.CREATE,
        element: (
            <ProtectedRoute requireOrganization={false}>
                <OrganizationCreatePage />
            </ProtectedRoute>
        ),
    },
    {
        element: <ProtectedLayout />,
        children: [
            { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
            { path: ROUTES.USERS.LIST, element: <UsersPage /> },
            { path: ROUTES.USERS.ADMINS, element: <AdminsPage /> },
            { path: ROUTES.USERS.STUDENTS, element: <StudentsPage /> },
            { path: ROUTES.ORGANIZATION.SETTINGS, element: <OrganizationSettingsPage /> },
            { 
                path: ROUTES.SUPERADMIN, 
                element: (
                    <ProtectedRoute allowedRoles={["SUPER_ADMIN",]}>
                        <SuperadminDashboardPage />
                    </ProtectedRoute>
                )
            },
        ],
    },
    {
        path: "*",
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
    },
]);
