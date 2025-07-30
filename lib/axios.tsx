// lib/axios.ts

import axios from "axios";
import { getSession, signOut } from "next-auth/react";
import { toast } from "sonner";

// Yönlendirmenin zaten tetiklenip tetiklenmediğini kontrol etmek için bir bayrak
let isRedirecting = false;

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// --- İstek (Request) Interceptor'ı ---
apiClient.interceptors.request.use(
    async (config) => {
        const session = await getSession();
        if (session?.accessToken) {
            config.headers['Authorization'] = `Bearer ${session.accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- Cevap (Response) Interceptor'ı (Düzeltilmiş Hali) ---
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const status = error.response?.status;

        // 401 veya 403 hatası varsa ve henüz yönlendirme başlamadıysa
        if ((status === 401 || status === 403) && !isRedirecting) {

            // Bayrağı true yaparak bu bloğun tekrar çalışmasını engelle
            isRedirecting = true;

            toast.error("Oturum Süresi Doldu!", {
                description: "Güvenlik nedeniyle oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın.",
                duration: 5000,
                onDismiss: () => {
                    // Toast kapandığında bayrağı sıfırla (isteğe bağlı ama iyi bir pratik)
                    isRedirecting = false;
                }
            });

            // Oturumu sonlandır ve login sayfasına yönlendir
            signOut({ callbackUrl: '/login' });
        }

        return Promise.reject(error);
    }
);

// SWR veya React Query için fetcher fonksiyonu
export const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);