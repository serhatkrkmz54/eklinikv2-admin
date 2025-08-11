import useSWR from 'swr';
import { fetcher } from '@/lib/axios';

export interface EmergencyCallLog {
    id: number;
    patient: {
        id: number;
        firstName: string;
        lastName: string;
    } | null;
    callerName: string;
    address: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    callTime: string; // ISO String
}

/**
 * Acil durum çağrı loglarını getirmek için SWR hook'u.
 */
export function useEmergencyCallLogs() {
    const { data, error, isLoading } = useSWR<EmergencyCallLog[]>(
        '/api/admin/emergency-logs',
        fetcher,
        { refreshInterval: 30000 }
    );

    return {
        logs: data,
        isLoading,
        error,
    };
}