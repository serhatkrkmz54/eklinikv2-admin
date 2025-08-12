'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { apiClient, fetcher } from '@/lib/axios';
import { toast } from 'sonner';
import { UserProfileResponse } from './useProfileService';

export interface AppointmentForDoctor {
    appointmentId: number;
    appointmentTime: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    patientInfo: UserProfileResponse;
}

export interface PatientHistoryItem {
    appointmentId: number;
    appointmentTime: string;
    diagnosis: string;
}

export interface PatientDetails {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    weight: number;
    height: number;
    hasChronicIllness: boolean;
    isMedicationDependent: boolean;
    address: string;
    history: PatientHistoryItem[];
}

export interface AppointmentDetailResponse {
    appointmentId: number;
    appointmentTime: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    patientDetails: PatientDetails;
}

export interface PrescriptionRequest {
    medicationName: string;
    dosage: string;
    duration: string;
}

export interface CompleteAppointmentRequest {
    diagnosis: string;
    notes?: string;
    prescriptions?: PrescriptionRequest[];
}

// --- API FUNCTIONS ---

async function completeAppointment(url: string, { arg }: { arg: CompleteAppointmentRequest }) {
    return apiClient.post(url, arg);
}

// --- SWR HOOKS ---

export function useDoctorAppointments(date: string | null) {
    const { data, error, isLoading, mutate } = useSWR<AppointmentForDoctor[]>(
        date ? `/api/doctor/appointments?date=${date}` : null,
        fetcher
    );
    return { appointments: data, isLoading, isError: error, mutate };
}

export function useAppointmentDetails(appointmentId: number | null) {
    const { data, error, isLoading } = useSWR<AppointmentDetailResponse>(
        appointmentId ? `/api/doctor/appointments/${appointmentId}` : null,
        fetcher
    );
    return { details: data, isLoading, isError: error };
}

export function useCompleteAppointment(appointmentId: number | null) {
    const { trigger, isMutating } = useSWRMutation(
        appointmentId ? `/api/doctor/appointments/${appointmentId}/complete` : null,
        completeAppointment
    );

    const handleComplete = async (data: CompleteAppointmentRequest) => {
        try {
            await trigger(data);
            toast.success("Randevu başarıyla tamamlandı.");
        } catch (error: any) {
            toast.error("İşlem Başarısız!", {
                description: error.response?.data?.message || "Randevu tamamlanırken bir hata oluştu.",
            });
            throw error;
        }
    };

    return {
        completeAppointment: handleComplete,
        isCompleting: isMutating,
    };
}
