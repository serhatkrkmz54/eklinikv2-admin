import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl } = req;
    const session = req.auth;

    const isLoggedIn = !!session?.user;
    const userRole = session?.user?.role;
    const isAdmin = userRole === "ROLE_ADMIN";
    const isDoctor = userRole === "ROLE_DOCTOR";

    const isLoginPage = nextUrl.pathname.startsWith("/login");
    const isAdminArea = nextUrl.pathname.startsWith("/admin");
    const isDoctorArea = nextUrl.pathname.startsWith("/doctor");
    const isHomePage = nextUrl.pathname === "/";

    if (isHomePage) {
        if (isAdmin) return NextResponse.redirect(new URL("/admin", nextUrl));
        if (isDoctor) return NextResponse.redirect(new URL("/doctor", nextUrl));
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    if (isAdminArea && !isAdmin) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    if (isDoctorArea && !isDoctor) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    if (isLoginPage && isLoggedIn) {
        if (isAdmin) return NextResponse.redirect(new URL("/admin", nextUrl));
        if (isDoctor) return NextResponse.redirect(new URL("/doctor", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};