import {useQuery, keepPreviousData, useQueryClient, useMutation} from '@tanstack/react-query';
import { apiClient } from "@/lib/axios";
import {
    UserResponse,
    DoctorResponse,
    UpdateUserRequest,
    PatientProfileRequest,
    PatientProfileResponse
} from "@/hooks/useUserProfile";
import { CreateUserFormValues } from "@/components/mycomp/dashboard/users/UserCreateForm";
import {toast} from "sonner";
export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}

export const createUser = async (userData: CreateUserFormValues): Promise<UserResponse> => {
    try {
        const response = await apiClient.post<UserResponse>("/api/admin/create-user", userData);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Kullanıcı oluşturulurken bir hata oluştu.");
    }
};

const getUsers = async (page: number, size: number, searchTerm: string, role: string, status: string): Promise<Page<UserResponse>> => {
    const params: any = {
        page,
        size,
        sort: 'createdAt,desc',
        status: status,
    };

    if (searchTerm) {
        params.searchTerm = searchTerm;
    }
    if (role && role !== "ALL") {
        params.role = role;
    }
    // if (status && status !== "ALL") params.status = status;

    const { data } = await apiClient.get<Page<UserResponse>>('/api/admin/users', { params });
    return data;
};

/**
 * Kullanıcıları getirmek için React Query hook'u.
 */
export const useUsers = (page: number, size: number, searchTerm: string, role: string, status: string) => {
    return useQuery<Page<UserResponse>, Error>({
        queryKey: ['users', page, size, searchTerm, role, status],
        queryFn: () => getUsers(page, size, searchTerm, role, status),
        placeholderData: keepPreviousData,
    });
};

const getUserById = async (userId: number): Promise<UserResponse> => {
    const { data } = await apiClient.get<UserResponse>(`/api/admin/users/${userId}`);
    return data;
};

/**
 * ID'ye göre tek bir kullanıcıyı getirmek için React Query hook'u.
 * Bu hook, sadece bir `userId` verildiğinde çalışır.
 */
export const useUserById = (userId: number | null) => {
    return useQuery<UserResponse, Error>({
        queryKey: ['user', userId],
        queryFn: () => getUserById(userId!),

        enabled: !!userId,
    });
};

const getDoctorByUserId = async (userId: number): Promise<DoctorResponse> => {
    const { data } = await apiClient.get<DoctorResponse>(`/api/admin/get-doctors/by-user/${userId}`);
    return data;
};

/**
 * User ID'ye ve role göre doktor profilini getirmek için React Query hook'u.
 */
export const useDoctorById = (userId: number | null, role: string | null) => {
    return useQuery<DoctorResponse, Error>({
        queryKey: ['doctor', userId],
        queryFn: () => getDoctorByUserId(userId!),
        enabled: !!userId && role === 'ROLE_DOCTOR',
    });
};

/**
 * ID'ye göre bir kullanıcıyı siler (pasif hale getirir).
 * @param userId - Silinecek kullanıcının ID'si
 */
const deleteUser = async (userId: number): Promise<string> => {
    const { data } = await apiClient.delete(`/api/admin/delete/users/${userId}`);
    return data;
};

/**
 * Kullanıcı silme işlemini yönetmek için React Query mutation hook'u.
 */
export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteUser,
        onSuccess: (data) => {
            toast.success("İşlem Başarılı!", {
                description: data,
            });

            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            toast.error("İşlem Başarısız!", {
                description: error.response?.data?.message || "Kullanıcı silinirken bir hata oluştu.",
            });
        },
    });
};

const reactivateUser = async (userId: number): Promise<UserResponse> => {
    const { data } = await apiClient.patch(`/api/admin/reactivate/users/${userId}`);
    return data;
};

/**
 * Kullanıcı aktif etme işlemini yönetmek için React Query mutation hook'u.
 */
export const useReactivateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: reactivateUser,
        onSuccess: (data) => {
            toast.success("İşlem Başarılı!", {
                description: `Kullanıcı '${data.firstName} ${data.lastName}' başarıyla aktif edildi.`,
            });
            // Tablonun otomatik olarak güncellenmesini sağlıyoruz.
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            toast.error("İşlem Başarısız!", {
                description: error.response?.data?.message || "Kullanıcı aktif edilirken bir hata oluştu.",
            });
        },
    });
};

const updateUser = async ({ id, userData }: { id: number, userData: UpdateUserRequest }): Promise<UserResponse> => {
    const { data } = await apiClient.put(`/api/admin/update/users/${id}`, userData);
    return data;
};

/**
 * Kullanıcı güncelleme işlemini yönetmek için React Query mutation hook'u.
 */
export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateUser,
        onSuccess: (updatedUser) => {
            toast.success("Kullanıcı Güncellendi!", {
                description: `${updatedUser.firstName} ${updatedUser.lastName} adlı kullanıcının bilgileri başarıyla güncellendi.`,
            });
            // Hem kullanıcı listesini ('users') hem de o kullanıcının detayını ('user', id)
            // geçersiz kılarak verilerin anında yenilenmesini sağlıyoruz.
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user', updatedUser.id] });
        },
        onError: (error: any) => {
            toast.error("Güncelleme Başarısız!", {
                description: error.response?.data?.message || "Kullanıcı güncellenirken bir hata oluştu.",
            });
        },
    });
};

const updatePatientProfile = async ({ userId, profileData }: { userId: number, profileData: PatientProfileRequest }): Promise<PatientProfileResponse> => {
    const { data } = await apiClient.put(`/api/admin/update-patient-profile/users/${userId}`, profileData);
    return data;
};

export const useUpdatePatientProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updatePatientProfile,
        onSuccess: (updatedProfile, variables) => {
            toast.success("Hasta Profili Güncellendi!");
            // Hem kullanıcı listesini hem de o kullanıcının detayını yenile
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
        },
        onError: (error: any) => {
            toast.error("Güncelleme Başarısız!", {
                description: error.response?.data?.message || "Hasta profili güncellenirken bir hata oluştu.",
            });
        },
    });
};