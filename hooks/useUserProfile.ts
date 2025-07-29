import useSWR from 'swr';
import { fetcher } from '@/lib/axios';

export interface UserResponse {
    id: number;
    nationalId: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: string;
    createdAt: string;
}

export function useUserProfile() {
    const { data, error, isLoading, mutate } = useSWR<UserResponse>('/api/auth/me', fetcher);

    return {
        user: data,
        error,
        isLoading,
        mutate,
    };
}