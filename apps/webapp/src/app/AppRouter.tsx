import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { ROUTES } from "./routes.config";
import { ProtectedLayout } from "./layout/ProtectedLayout";
import { LoginPage } from "@/features/auth/presentation/pages/login-page";
import { RegisterPage } from "@/features/auth/presentation/pages/register-page";

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
        element: <ProtectedLayout />,
        children: [
            { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
            { path: ROUTES.USERS.LIST, element: <UsersPage /> },
            { path: ROUTES.USERS.ADMINS, element: <AdminsPage /> },
            { path: ROUTES.USERS.STUDENTS, element: <StudentsPage /> },
        ],
    },
    {
        path: "*",
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
    },
]);
