// lib/axios.ts

import axios from "axios";
import { getSession } from "next-auth/react"; // Client-side session almak için

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Axios Interceptor: Her istek gönderilmeden önce çalışır.
// Bu sayede her isteğe dinamik olarak Authorization header'ı ekleyebiliriz.
apiClient.interceptors.request.use(
    async (config) => {
        // Client tarafında session'ı alıyoruz
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

// SWR'ın kullanacağı genel fetcher fonksiyonu
export const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);