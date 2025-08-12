import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import axios from "axios";
import { z } from "zod";
import { jwtDecode } from "jwt-decode";
import {toast} from "sonner";

interface DecodedToken {
    sub: string;
    role: string | string[];
    iat: number;
    exp: number;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                nationalId: {},
                password: {},
                loginType: {},
            },
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({
                        nationalId: z.string().length(11),
                        password: z.string().min(1),
                        loginType: z.enum(['admin', 'doctor']),
                    })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { nationalId, password, loginType } = parsedCredentials.data;
                    const api_url = process.env.NEXT_PUBLIC_API_URL;

                    try {
                        const res = await axios.post(
                            `${api_url}/api/auth/login`,
                            { nationalId, password },
                            { headers: { "Content-Type": "application/json" } }
                        );

                        const loginResponse = res.data;

                        if (res.status === 200 && loginResponse.accessToken) {
                            const decodedToken: DecodedToken = jwtDecode(loginResponse.accessToken);
                            const userRole = Array.isArray(decodedToken.role) ? decodedToken.role[0] : decodedToken.role;

                            if (!userRole) {
                                toast.error("Giriş Başarısız", {
                                    description: "Token içinde rol bilgisi bulunamadı.",
                                });
                            }

                            if (loginType === 'admin' && userRole !== 'ROLE_ADMIN') {
                                toast.error("Giriş Başarısız", {
                                    description: "Bu hesaba admin olarak giriş yapma yetkiniz yok.",
                                });
                            }

                            if (loginType === 'doctor' && userRole !== 'ROLE_DOCTOR') {
                                toast.error("Giriş Başarısız", {
                                    description: "Bu hesaba doktor olarak giriş yapma yetkiniz yok.",
                                });
                            }

                            return {
                                id: decodedToken.sub,
                                name: decodedToken.sub,
                                role: userRole,
                                accessToken: loginResponse.accessToken,
                            };
                        }
                        // Başarılı yanıt gelmezse null döndürerek genel bir hata tetikle
                        return null;
                    } catch (error: any) {
                        console.error("Login hatası:", error.response?.data || error.message);
                        toast.error("Giriş Başarısız", {
                            description: "T.C. Kimlik Numarası veya şifre hatalı.",
                        });
                    }
                }
                // Zod validasyonu başarısız olursa null döndür
                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = user.accessToken;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.accessToken) {
                session.accessToken = token.accessToken as string;
            }
            if (token.role) {
                session.user.role = token.role as string;
            }
            if (token.sub) {
                session.user.id = token.sub;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
});
