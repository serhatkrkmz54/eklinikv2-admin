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

const updateClinic = async ({ id, clinicData }: { id: number, clinicData: ClinicRequest }): Promise<ClinicResponse> => {
    const { data } = await apiClient.put<ClinicResponse>(`/api/admin/update-clinics/clinics/${id}`, clinicData);
    return data;
};

/**
 * Bir kliniği siler.
 */
const deleteClinic = async (id: number): Promise<string> => {
    const { data } = await apiClient.delete<string>(`/api/admin/clinics/${id}`);
    return data;
};


// --- REACT QUERY HOOK'LARI ---

// ... useCreateClinic ve useClinics hook'ları aynı ...

/**
 * Klinik güncelleme işlemini yönetmek için mutation hook'u.
 */
export const useUpdateClinic = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateClinic,
        onSuccess: (updatedClinic) => {
            toast.success("Klinik Güncellendi!", {
                description: `'${updatedClinic.name}' olarak başarıyla güncellendi.`,
            });
            queryClient.invalidateQueries({ queryKey: ['clinics'] });
        },
        onError: (error: any) => {
            toast.error("Güncelleme Başarısız!", {
                description: error.response?.data?.message || "Klinik güncellenirken bir hata oluştu.",
            });
        },
    });
};

/**
 * Klinik silme işlemini yönetmek için mutation hook'u.
 */
export const useDeleteClinic = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteClinic,
        onSuccess: (message) => {
            toast.success("Klinik Silindi!", {
                description: message,
            });
            queryClient.invalidateQueries({ queryKey: ['clinics'] });
        },
        onError: (error: any) => {
            toast.error("Silme İşlemi Başarısız!", {
                description: error.response?.data?.message || "Klinik silinirken bir hata oluştu.",
            });
        },
    });
};