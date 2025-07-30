import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from "@/lib/axios"; // Merkezi axios instance'ınız
import { UserResponse,DoctorResponse } from "@/hooks/useUserProfile"; // Merkezi UserResponse tipiniz
import { CreateUserFormValues } from "@/components/mycomp/dashboard/users/UserCreateForm";

// --- TİPLER ---

// Backend'in Page<T> yapısına karşılık gelen genel tip
export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number; // Mevcut sayfa numarası
    size: number;
}


// --- API FONKSİYONLARI ---

/**
 * Yeni bir kullanıcı oluşturur. (Bu zaten vardı)
 */
export const createUser = async (userData: CreateUserFormValues): Promise<UserResponse> => {
    try {
        const response = await apiClient.post<UserResponse>("/api/admin/create-user", userData);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Kullanıcı oluşturulurken bir hata oluştu.");
    }
};

const getUsers = async (page: number, size: number, searchTerm: string, role: string): Promise<Page<UserResponse>> => {
    // Backend'e gönderilecek parametreleri oluşturuyoruz
    const params: any = {
        page,
        size,
        sort: 'createdAt,desc'
    };

    if (searchTerm) {
        params.searchTerm = searchTerm; // Arama terimi
    }
    if (role && role !== "ALL") { // "ALL" seçeneği hariç rolleri gönder
        params.role = role;
    }

    const { data } = await apiClient.get<Page<UserResponse>>('/api/admin/users', { params });
    return data;
};

/**
 * Kullanıcıları getirmek için React Query hook'u.
 */
export const useUsers = (page: number, size: number, searchTerm: string, role: string) => {
    return useQuery<Page<UserResponse>, Error>({
        // queryKey artık arama ve rolü de içeriyor. Bu sayede filtre değiştiğinde veri otomatik yenilenir.
        queryKey: ['users', page, size, searchTerm, role],
        queryFn: () => getUsers(page, size, searchTerm, role),
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
        queryKey: ['user', userId], // Her kullanıcı için benzersiz bir anahtar
        queryFn: () => getUserById(userId!), // userId null olmayacağı için '!' kullanabiliriz

        // Bu sorgunun sadece userId null veya undefined değilken çalışmasını sağlar.
        // Bu, gereksiz API çağrılarını önler.
        enabled: !!userId,
    });
};

const getDoctorById = async (userId: number): Promise<DoctorResponse> => {
    // Controller'da endpoint @GetMapping("/get-doctors/{id}") şeklinde
    // ama bu id, user tablosunun id'si mi yoksa doctor tablosunun mu?
    // Genellikle user id'si olur. Endpoint'i ona göre düzeltiyoruz.
    // Eğer doctorId ise, userId yerine doctorId göndermelisiniz.
    const { data } = await apiClient.get<DoctorResponse>(`/api/admin/get-doctors/${userId}`);
    return data;
};

/**
 * ID'ye ve role göre doktor profilini getirmek için React Query hook'u.
 * Bu hook, sadece bir `userId` verildiğinde VE rol 'ROLE_DOCTOR' ise çalışır.
 */
export const useDoctorById = (userId: number | null, role: string | null) => {
    return useQuery<DoctorResponse, Error>({
        queryKey: ['doctor', userId],
        queryFn: () => getDoctorById(userId!),

        // Sadece userId varsa VE rolü doktorsa bu sorguyu çalıştır
        enabled: !!userId && role === 'ROLE_DOCTOR',
    });
};