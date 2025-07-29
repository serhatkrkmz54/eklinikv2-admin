// types/next-auth.d.ts

import type { DefaultSession, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

// NextAuth'un modülünü genişleterek kendi tiplerimizi ekliyoruz.

declare module "next-auth" {
    /**
     * `useSession` hook'u ve `auth()` fonksiyonundan dönen session objesinin tipini genişletir.
     */
    interface Session extends DefaultSession {
        accessToken?: string;
        user: {
            role: string;
            // Varsayılan User tipindeki diğer alanları korumak için `&` kullanıyoruz.
        } & DefaultSession["user"];
    }

    /**
     * `authorize` fonksiyonundan dönen veya adapter'da kullanılan User objesinin tipini genişletir.
     */
    interface User {
        role?: string;
        accessToken?: string;
    }
}

declare module "next-auth/jwt" {
    /**
     * `jwt` callback'indeki `token` objesinin tipini genişletir.
     */
    interface JWT {
        role?: string;
        accessToken?: string;
    }
}