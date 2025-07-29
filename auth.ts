// auth.ts

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import axios from "axios";
import { z } from "zod";
import { jwtDecode } from "jwt-decode";

// JWT'den decode edilecek verinin tipini belirliyoruz.
interface DecodedToken {
    sub: string; // Subject (Genellikle kullanıcı ID'si veya username, bizim durumumuzda T.C. Kimlik)
    role: string[]; // Rollerinizi buraya ekleyebilirsiniz, backend'e göre ayarlayın
    iat: number;
    exp: number;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            // Login formunda kullanılacak alanları tanımlayabilirsiniz (opsiyonel, formumuzu kendimiz yapacağız)
            credentials: {
                nationalId: {},
                password: {},
            },
            // Bu fonksiyon, login işlemi denendiğinde çalışacak ana mantığı içerir.
            async authorize(credentials) {
                // Gelen credential'ları Zod ile doğruluyoruz.
                const parsedCredentials = z
                    .object({
                        nationalId: z.string().length(11),
                        password: z.string().min(1),
                    })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { nationalId, password } = parsedCredentials.data;
                    const api_url = process.env.NEXT_PUBLIC_API_URL;

                    try {
                        // Spring Boot backend'imize istek atıyoruz.
                        const res = await axios.post(
                            `${api_url}/api/auth/login`,
                            {
                                nationalId: nationalId,
                                password: password,
                            },
                            {
                                headers: { "Content-Type": "application/json" },
                            }
                        );

                        // Backend'den gelen cevabı alıyoruz.
                        const loginResponse = res.data;

                        if (res.status === 200 && loginResponse.accessToken) {
                            // JWT'yi decode ederek içindeki bilgilere ulaşıyoruz.
                            const decodedToken: DecodedToken = jwtDecode(loginResponse.accessToken);

                            // Sadece ADMIN rolüne sahip olanların girişine izin ver.
                            if (!decodedToken.role.includes("ROLE_ADMIN")) {
                                console.log("Giriş denemesi: Kullanıcı ADMIN değil.");
                                return null; // Yetkisi yoksa null döndürerek girişi engelle.
                            }

                            // Auth.js'in user objesini oluşturuyoruz.
                            // Bu obje, `jwt` callback'ine `user` parametresi olarak gidecek.
                            return {
                                id: decodedToken.sub, // T.C. Kimlik Numarası
                                name: decodedToken.sub, // İsim bilgisi yoksa T.C. Kİmlik yazabiliriz
                                role: "ROLE_ADMIN", // Rolü ekliyoruz
                                accessToken: loginResponse.accessToken,
                            };
                        }

                        // Backend'den token gelmediyse veya status 200 değilse.
                        return null;

                    } catch (error: any) {
                        console.error("Login hatası:", error.response?.data || error.message);
                        // Axios hatası durumunda, backend'den gelen hata mesajını yakalayabiliriz.
                        // Bu, kullanıcıya daha spesifik hata mesajları göstermemizi sağlar.
                        // Şimdilik genel bir hata için null dönüyoruz.
                        return null;
                    }
                }
                return null;
            },
        }),
    ],
    callbacks: {
        // Bu callback, JWT oluşturulduğunda veya güncellendiğinde çalışır.
        // `authorize` fonksiyonundan dönen `user` objesi buraya gelir.
        async jwt({ token, user }) {
            // Eğer `user` objesi varsa (yani ilk giriş anıysa),
            // accessToken'ı ve rolü token'a ekliyoruz.
            if (user) {
                token.accessToken = user.accessToken;
                token.role = user.role;
            }
            return token;
        },

        // Bu callback, session'a erişildiğinde (örneğin `useSession` veya `auth()`) çalışır.
        // Client tarafına hangi verilerin gönderileceğini belirleriz.
        async session({ session, token }) {
            // Token'daki verileri session'a ekliyoruz.
            if (token.accessToken) {
                session.accessToken = token.accessToken as string;
            }
            if (token.role) {
                session.user.role = token.role as string;
            }
            if (token.sub) {
                session.user.id = token.sub; // T.C. Kimlik Numarasını session'a ekleyelim
            }
            return session;
        },
    },
    pages: {
        // Kullanıcı girişi gerektiren bir sayfaya erişmeye çalıştığında yönlendirileceği sayfa.
        signIn: "/login",
    },
});