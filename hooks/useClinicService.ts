'use client';

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { toast } from 'sonner';

export interface ClinicResponse {
    id: number;
    name: string;
}

export interface ClinicRequest {
    name: string;
}


/**
 * Yeni bir klinik oluşturur.
 */
const createClinic = async (clinicData: ClinicRequest): Promise<ClinicResponse> => {
    const { data } = await apiClient.post<ClinicResponse>('/api/admin/create-clinics', clinicData);
    return data;
};

/**
 * Tüm klinikleri listeler (Son eklenenleri göstermek için).
 */
const getClinics = async (): Promise<ClinicResponse[]> => {
    const { data } = await apiClient.get<ClinicResponse[]>('/api/admin/all-clinics');
    return data;
};


/**
 * Klinik oluşturma işlemini yönetmek için mutation hook'u.
 */
export const useCreateClinic = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createClinic,
        onSuccess: (newClinic) => {
            toast.success("Klinik Oluşturuldu!", {
                description: `'${newClinic.name}' adlı klinik başarıyla sisteme eklendi.`,
            });
            queryClient.invalidateQueries({ queryKey: ['clinics'] });
        },
        onError: (error: any) => {
            toast.error("Oluşturma Başarısız!", {
                description: error.response?.data?.message || "Klinik oluşturulurken bir hata oluştu.",
            });
        },
    });
};

/**
 * Klinik listesini getirmek için query hook'u.
 */
export const useClinics = () => {
    return useQuery<ClinicResponse[], Error>({
        queryKey: ['clinics'],
        queryFn: getClinics,
    });
};