import useSWR from 'swr';
import { fetcher } from '@/lib/axios';

interface CountResponse {
    count: number;
}

export interface MonthlyNewPatientData {
    month: string;
    count: number;
}

export interface ClinicAppointmentCountDataResponse {
    clinicName: string;
    appointmentCount: number;
}

export interface UpcomingAppointment {
    appointmentId: number;
    patientFullName: string;
    doctorFullName: string;
    clinicName: string;
    appointmentTime: string;
}

export function useClinicCount() {
    const { data, error, isLoading } = useSWR<CountResponse>('/api/admin/clinic-count', fetcher);

    return {
        count: data?.count,
        isLoading,
        error,
    };
}

export function useDoctorCount() {
    const { data, error, isLoading } = useSWR<CountResponse>('/api/admin/doctor-count', fetcher);

    return {
        count: data?.count,
        isLoading,
        error,
    };
}

export function usePatientCount() {
    const { data, error, isLoading } = useSWR<CountResponse>('/api/admin/patient-count', fetcher);
    return { count: data?.count, isLoading, error };
}

export function useDailyAppointmentCount() {
    const { data, error, isLoading } = useSWR<CountResponse>(
        '/api/admin/daily-appointments',
        fetcher
    );

    return {
        count: data?.count,
        isLoading,
        error,
    };
}

export function useMonthlyNewPatientStats() {
    const { data, error, isLoading } = useSWR<MonthlyNewPatientData[]>(
        '/api/admin/monthly-new-patients',
        fetcher
    );

    return {
        chartData: data,
        isLoading,
        error,
    };
}

export function useClinicAppointmentDensity() {
    const { data, error, isLoading } = useSWR<ClinicAppointmentCountDataResponse[]>(
        '/api/admin/clinic-appointment-density',
        fetcher
    );

    return {
        densityData: data,
        isLoading,
        error,
    };
}

export function useUpcomingAppointments() {
    const { data, error, isLoading } = useSWR<UpcomingAppointment[]>(
        '/api/admin/upcoming-appointments',
        fetcher,
        { refreshInterval: 60000 }
    );

    return {
        upcomingAppointments: data,
        isLoading,
        error,
    };
}