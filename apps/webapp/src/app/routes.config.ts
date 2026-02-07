import { LayoutDashboard, Users } from "lucide-react";

export const ROUTES = {
    LOGIN: "/login",
    DASHBOARD: "/",
    USERS: {
        LIST: "/users",
        ADMINS: "/users/admins",
        STUDENTS: "/users/students",
    },
} as const;

export const SidebarRoutes = {
    user: {
        name: "User",
        email: "user@example.com",
        avatar: "/avatars/user.jpg",
    },
    teams: [
        {
            name: "Sales Team",
            logo: LayoutDashboard,
            plan: "Pro",
        },
    ],
    navMain: [
        {
            title: "Dashboard",
            url: ROUTES.DASHBOARD,
            icon: LayoutDashboard,
            isActive: true,
        },
        {
            title: "Users",
            url: ROUTES.USERS.LIST,
            icon: Users,
            items: [
                {
                    title: "Admins",
                    url: ROUTES.USERS.ADMINS,
                },
                {
                    title: "Students",
                    url: ROUTES.USERS.STUDENTS,
                },
            ],
        },
    ],
    projects: [],
};

export function isActiveRoute(currentPath: string, routePath: string): boolean {
    return currentPath === routePath || currentPath.startsWith(routePath + "/");
}
