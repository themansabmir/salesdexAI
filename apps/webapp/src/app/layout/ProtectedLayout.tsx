import { Outlet } from "react-router-dom";
import { ProtectedRoute } from "../ProtectedRoute";
import { DashboardLayout } from "./DashboardLayout";

export function ProtectedLayout() {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                <Outlet />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
