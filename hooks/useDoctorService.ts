import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";

export interface UserResponse {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

export interface ClinicResponse {
    id: number;
    name: string;
}

export interface DoctorResponse {
    doctorId: number;
    title: string;
    user: UserResponse;
    clinic: ClinicResponse;
}

export interface DoctorRequest {
    userId: number;
    clinicId: number;
    title: string;
}

export interface UpdateDoctorRequest {
    title?: string;
    clinicId?: number;
}

const getAvailableUsers = async (): Promise<UserResponse[]> => {
    const { data } = await apiClient.get('/api/admin/users', { params: { size: 1000, role: 'ROLE_PATIENT' } });
    return data.content;
};

const getClinics = async (): Promise<ClinicResponse[]> => {
    const { data } = await apiClient.get('/api/admin/all-clinics');
    return data;
};

const doctorService = {
    getAll: async (): Promise<DoctorResponse[]> => {
        const { data } = await apiClient.get("/api/admin/get-doctors");
        return data;
    },
    getById: async (id: number): Promise<DoctorResponse> => {
        const { data } = await apiClient.get(`/api/admin/get-doctors/${id}`);
        return data;
    },
    create: async (request: DoctorRequest): Promise<DoctorResponse> => {
        const { data } = await apiClient.post("/api/admin/create-doctors", request);
        return data;
    },
    update: async ({ id, request }: { id: number; request: UpdateDoctorRequest }): Promise<DoctorResponse> => {
        const { data } = await apiClient.put(`/api/admin/update-doctors/doctors/${id}`, request);
        return data;
    },
    delete: async (id: number): Promise<string> => {
        const { data } = await apiClient.delete(`/api/admin/delete/doctors/${id}`);
        return data;
    },
};


export const useAvailableUsers = () => useQuery<UserResponse[], Error>({
    queryKey: ['availableUsersForDoctor'],
    queryFn: getAvailableUsers
});

export const useClinics = () => useQuery<ClinicResponse[], Error>({
    queryKey: ['clinics'],
    queryFn: getClinics
});

export const useDoctors = () => useQuery<DoctorResponse[], Error>({
    queryKey: ['doctors'],
    queryFn: doctorService.getAll
});

export const useDoctorById = (doctorId: number | null) => {
    return useQuery<DoctorResponse, Error>({
        queryKey: ['doctor', doctorId],
        queryFn: () => doctorService.getById(doctorId!),
        enabled: !!doctorId,
    });
};

export const useCreateDoctor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: doctorService.create,
        onSuccess: (newDoctor) => {
            toast.success(`Dr. ${newDoctor.user.firstName} ${newDoctor.user.lastName} başarıyla oluşturuldu.`);
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            queryClient.invalidateQueries({ queryKey: ['availableUsersForDoctor'] }); // Doktor olan kullanıcı listeden düşmeli
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Doktor oluşturulurken hata oluştu."),
    });
};

export const useUpdateDoctor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: doctorService.update,
        onSuccess: (updatedDoctor) => {
            toast.success(`Dr. ${updatedDoctor.user.firstName} bilgileri güncellendi.`);
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            queryClient.invalidateQueries({ queryKey: ['doctor', updatedDoctor.doctorId] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Doktor güncellenirken hata oluştu."),
    });
};

export const useDeleteDoctor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: doctorService.delete,
        onSuccess: (message) => {
            toast.success("Doktor başarıyla silindi.", { description: message });
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            queryClient.invalidateQueries({ queryKey: ['availableUsersForDoctor'] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Doktor silinirken hata oluştu."),
    });
};
