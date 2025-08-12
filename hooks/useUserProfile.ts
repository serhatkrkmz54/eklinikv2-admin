import useSWR from 'swr';
import { fetcher } from '@/lib/axios';

export interface UserResponse {
    id: number;
    nationalId: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: "ROLE_PATIENT" | "ROLE_DOCTOR" | "ROLE_ADMIN";
    createdAt: string;
    deleted: boolean;
    patientProfile: PatientProfileResponse | null;
}

export interface PatientProfileResponse {
    dateOfBirth: string;
    weight: number;
    height: number;
    hasChronicIllness: boolean;
    isMedicationDependent: boolean;
    birthPlaceCity: string;
    birthPlaceDistrict: string;
    address: string;
    country: string;
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

export interface UpdateUserRequest {
    email?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    role?: "ROLE_PATIENT" | "ROLE_DOCTOR" | "ROLE_ADMIN";
}

export interface PatientProfileRequest {
    dateOfBirth?: string | null;
    weight?: number | null;
    height?: number | null;
    hasChronicIllness?: boolean;
    isMedicationDependent?: boolean;
    birthPlaceCity?: string | null;
    birthPlaceDistrict?: string | null;
    address?: string | null;
    country?: string | null;
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