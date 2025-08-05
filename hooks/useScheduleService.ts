import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { DoctorResponse } from './useDoctorService';

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type ScheduleStatus = 'AVAILABLE' | 'BOOKED' | 'COMPLETED' | 'CANCELLED';

export interface ScheduleGenerationRequest {
    doctorId: number;
    startDate: string;
    endDate: string;
    workStartTime: string;
    workEndTime: string;
    workDays: DayOfWeek[];
    lunchStartTime: string | null;
    lunchEndTime: string | null;
    slotDurationInMinutes: number;
}

export interface ScheduleResponse {
    id: number;
    startTime: string;
    endTime: string;
    status: ScheduleStatus;
}

const getDoctorsForScheduling = async (): Promise<DoctorResponse[]> => {
    const { data } = await apiClient.get("/api/admin/get-doctors");
    return data;
};

const generateSchedules = async (request: ScheduleGenerationRequest): Promise<string> => {
    const { data } = await apiClient.post("/api/admin/schedules/generate", request);
    return data;
};

const getSchedulesForDoctor = async (doctorId: number, date: string): Promise<ScheduleResponse[]> => {
    const { data } = await apiClient.get(`/api/admin/doctors/${doctorId}/schedules`, { params: { date } });
    return data;
};

const deleteScheduleSlot = async (scheduleId: number): Promise<string> => {
    const { data } = await apiClient.delete(`/api/admin/schedules/${scheduleId}`);
    return data;
};

export const useDoctorsForScheduling = () => {
    return useQuery<DoctorResponse[], Error>({
        queryKey: ['doctorsForScheduling'],
        queryFn: getDoctorsForScheduling
    });
};

export const useGenerateSchedules = () => {
    return useMutation({
        mutationFn: generateSchedules,
        onSuccess: (message) => toast.success("Takvim Başarıyla Oluşturuldu!", { description: message }),
        onError: (error: any) => toast.error("Bir Hata Oluştu", { description: error.response?.data?.message || "Takvim oluşturulamadı." }),
    });
};

export const useSchedulesForDoctor = (doctorId: number | null, date: string | null) => {
    return useQuery<ScheduleResponse[], Error>({
        queryKey: ['schedules', doctorId, date],
        queryFn: () => getSchedulesForDoctor(doctorId!, date!),
        enabled: !!doctorId && !!date,
    });
};

export const useDeleteScheduleSlot = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteScheduleSlot,
        onSuccess: (message) => {
            toast.success("Zaman Dilimi Silindi", { description: message });
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
        },
        onError: (error: any) => {
            toast.error("Silme Başarısız", { description: error.response?.data?.message || "Zaman dilimi silinemedi." });
        },
    });
};
