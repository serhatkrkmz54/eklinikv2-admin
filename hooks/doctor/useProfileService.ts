'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { apiClient, fetcher } from '@/lib/axios';
import { toast } from 'sonner';

export interface DoctorInfoForProfile {
    title: string;
    clinicName: string;
}

export interface UserProfileResponse {
    id: number;
    nationalId: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: string;
    createdAt: string;
    deleted: boolean;
    doctorInfo?: DoctorInfoForProfile;
}

export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
}

async function updateProfile(url: string, { arg }: { arg: UpdateProfileRequest }) {
    return apiClient.put(url, arg);
}

export function useMyProfile() {
    const { data, error, isLoading, mutate } = useSWR<UserProfileResponse>('/api/auth/me', fetcher);

    return {
        profile: data,
        isLoading,
        isError: error,
        mutate,
    };
}

export function useUpdateMyProfile() {
    const { trigger, isMutating } = useSWRMutation('/api/auth/update-profile', updateProfile);

    const handleUpdate = async (data: UpdateProfileRequest) => {
        try {
            await trigger(data);
            toast.success("Profiliniz başarıyla güncellendi.");
        } catch (error: any) {
            toast.error("Güncelleme Başarısız!", {
                description: error.response?.data?.message || "Profil güncellenirken bir hata oluştu.",
            });
            throw error;
        }
    };

    return {
        updateProfile: handleUpdate,
        isUpdating: isMutating,
    };
}