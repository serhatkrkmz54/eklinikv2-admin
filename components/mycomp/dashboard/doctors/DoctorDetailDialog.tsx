'use client';

import React from 'react';
import {DoctorResponse as OriginalDoctorResponse, useDoctorById} from '@/hooks/useDoctorService';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {VisuallyHidden} from '@radix-ui/react-visually-hidden';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Skeleton} from '@/components/ui/skeleton';
import {Badge} from '@/components/ui/badge';
import {Building, Calendar, Fingerprint, Mail, Phone, ShieldCheck} from 'lucide-react';

interface UserResponse {
    id: number;
    nationalId: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: string;
    createdAt: string | null;
    deleted: boolean;
    patientProfile: any | null;
}
interface DoctorResponse extends Omit<OriginalDoctorResponse, 'user'> {
    user: UserResponse;
}

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | null }) => (
    <div>
        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
            <Icon className="h-4 w-4 text-primary" />
            {label}
        </p>
        <p className="font-semibold text-foreground text-base ml-6">{value || 'Belirtilmemiş'}</p>
    </div>
);

const DetailSkeleton = () => (
    <div className="w-full">
        <div className="flex flex-col items-center gap-4 p-6 text-center bg-muted/50 border-b">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-7 w-48 mx-auto" />
                <Skeleton className="h-5 w-32 mx-auto" />
                <Skeleton className="h-5 w-40 mx-auto" />
            </div>
        </div>
        <div className="p-6 space-y-6">
            <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
            <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    </div>
);

interface DoctorDetailDialogProps {
    doctorId: number | null;
    onOpenChange: (open: boolean) => void;
}

export function DoctorDetailDialog({ doctorId, onOpenChange }: DoctorDetailDialogProps) {
    const { data: doctor, isLoading, error } = useDoctorById(doctorId) as { data?: DoctorResponse, isLoading: boolean, error: Error | null };

    const getRoleInTurkish = (role: string) => {
        const roles: { [key: string]: string } = {
            'ROLE_DOCTOR': 'Doktor',
            'ROLE_PATIENT': 'Hasta',
            'ROLE_ADMIN': 'Yönetici',
        };
        return roles[role] || role;
    };

    return (
        <Dialog open={!!doctorId} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
                <VisuallyHidden>
                    {/* Erişilebilirlik için başlıklar korunuyor */}
                    <DialogHeader>
                        <DialogTitle>{doctor ? `Doktor Detayı: ${doctor.user.firstName} ${doctor.user.lastName}` : 'Doktor Detayları'}</DialogTitle>
                        <DialogDescription>
                            {doctor ? `${doctor.title} ünvanlı, ${doctor.clinic.name} kliniğinde görevli doktorun detaylı bilgileri.` : 'Doktor bilgileri yükleniyor...'}
                        </DialogDescription>
                    </DialogHeader>
                </VisuallyHidden>

                {isLoading ? (
                    <DetailSkeleton />
                ) : error ? (
                    <div className="p-8 text-center text-destructive">
                        <p className="font-semibold">Doktor bilgileri yüklenemedi.</p>
                        <p className="text-xs mt-2">{error.message}</p>
                    </div>
                ) : doctor ? (
                    <div className="w-full">
                        <div className="flex flex-col items-center gap-2 p-6 text-center bg-muted/50 border-b">
                            <Avatar className="h-24 w-24 mb-2 border-4 border-background">
                                <AvatarFallback className="text-4xl font-semibold bg-sky-100 text-sky-700">
                                    {doctor.user.firstName?.[0]}{doctor.user.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-2xl font-bold text-foreground">
                                {doctor.user.firstName} {doctor.user.lastName}
                            </h2>
                            <Badge variant="outline" className="text-base font-medium border-sky-300 bg-sky-50 text-sky-800">{doctor.title}</Badge>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <Building className="h-4 w-4" />
                                {doctor.clinic.name}
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-foreground">İletişim Bilgileri</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InfoRow icon={Mail} label="E-posta Adresi" value={doctor.user.email} />
                                    <InfoRow icon={Phone} label="Telefon Numarası" value={doctor.user.phoneNumber} />
                                </div>
                            </div>

                            <hr />

                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-foreground">Sistem Bilgileri</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InfoRow icon={Fingerprint} label="TC Kimlik Numarası" value={doctor.user.nationalId} />
                                    <InfoRow icon={ShieldCheck} label="Kullanıcı Rolü" value={getRoleInTurkish(doctor.user.role)} />
                                    <InfoRow icon={Calendar} label="Kayıt Tarihi" value={doctor.user.createdAt ? new Date(doctor.user.createdAt).toLocaleDateString('tr-TR') : '-'} />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}