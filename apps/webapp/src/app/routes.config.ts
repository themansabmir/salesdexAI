export const ROUTES = {
    LOGIN: "/login",
    DASHBOARD: "/",
    USERS: {
        LIST: "/users",
        ADMINS: "/users/admins",
        STUDENTS: "/users/students",
    },
} as const;

export function isActiveRoute(currentPath: string, routePath: string): boolean {
    return currentPath === routePath || currentPath.startsWith(routePath + "/");
}
