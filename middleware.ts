// middleware.ts

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl } = req;
    const session = req.auth;

    const isAdmin = session?.user?.role === "ROLE_ADMIN";
    const isLoggedIn = !!session?.user;

    const isAdminArea = nextUrl.pathname.startsWith("/admin");
    const isLoginPage = nextUrl.pathname.startsWith("/login");
    const isHomePage = nextUrl.pathname === "/";

    // --- ANA ROTA (/) İÇİN YÖNLENDİRME MANTIĞI ---
    // Tarayıcıya sadece 'localhost:3000' yazıldığında bu blok çalışır.
    if (isHomePage) {
        if (isLoggedIn && isAdmin) {
            // Giriş yapmış bir admin ise, /admin'e yönlendir.
            return NextResponse.redirect(new URL("/admin", nextUrl));
        } else {
            // Giriş yapmamışsa (veya admin değilse), /login'e yönlendir.
            return NextResponse.redirect(new URL("/login", nextUrl));
        }
    }

    // --- DİĞER KORUMALAR ---

    // Admin olmayanların /admin altına direkt erişimini engelleme
    // Bu kontrol, /admin/* yollarına direkt gitmeye çalışanları yakalar.
    if (isAdminArea && !isAdmin) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // Giriş yapmış kullanıcıların /login sayfasına tekrar gitmesini engelleme
    if (isLoginPage && isLoggedIn && isAdmin) {
        return NextResponse.redirect(new URL("/admin", nextUrl));
    }

    // Yukarıdaki kurallara uymayan diğer tüm istekler için devam et.
    return NextResponse.next();
});

export const config = {
    matcher: [
        /*
         * Aşağıdaki yollarla eşleşenler hariç tüm istek yollarını eşleştir:
         * - api (API rotaları)
         * - _next/static (static dosyalar)
         * - _next/image (resim optimizasyon dosyaları)
         * - favicon.ico (favicon dosyası)
         *
         * ÖNEMLİ: Ana sayfa (/) ve /admin, /login yollarını bu listeye dahil ediyoruz.
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};