'use client';

import {useAppointmentDetails} from '@/hooks/doctor/useAppointmentService';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Skeleton} from '@/components/ui/skeleton';
import {Separator} from '@/components/ui/separator';
import {CompleteAppointmentForm} from './CompleteAppointmentForm';
import {AlertTriangle} from 'lucide-react';
import {cn} from '@/lib/utils';
import {differenceInYears, format, parseISO} from 'date-fns';

interface AppointmentDetailViewProps {
    appointmentId: number | null;
    onAppointmentComplete: () => void;
}

export function AppointmentDetailView({ appointmentId, onAppointmentComplete }: AppointmentDetailViewProps) {
    const { details, isLoading, isError } = useAppointmentDetails(appointmentId);

    const calculateAge = (birthDateString?: string | null): number | null => {
        if (!birthDateString) return null;
        try {
            const birthDate = parseISO(birthDateString);
            return differenceInYears(new Date(), birthDate);
        } catch (e) {
            console.error("Geçersiz tarih formatı:", birthDateString);
            return null;
        }
    };

    if (!appointmentId) {
        return (
            <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center text-muted-foreground">
                    <p className="font-semibold">Detayları görmek için bir randevu seçin.</p>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) return <DetailSkeleton />;
    if (isError) return <p>Hata...</p>;

    const age = calculateAge(details?.patientDetails.dateOfBirth);

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl">{details?.patientDetails.firstName} {details?.patientDetails.lastName}</CardTitle>
                <CardDescription>Randevu Detayları ve Tıbbi Geçmiş</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 mb-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <h3 className="font-semibold flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Kritik Tıbbi Bilgiler
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <CriticalInfoItem
                            label="Kronik Hastalık"
                            value={details?.patientDetails.hasChronicIllness}
                        />
                        <CriticalInfoItem
                            label="Sürekli İlaç Kullanımı"
                            value={details?.patientDetails.isMedicationDependent}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold">Hasta Bilgileri</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {/* DÜZELTME: Yaş bilgisi eklendi */}
                        <InfoItem
                            label="Doğum Tarihi"
                            value={details?.patientDetails.dateOfBirth
                                ? `${format(parseISO(details.patientDetails.dateOfBirth), 'dd.MM.yyyy')} (${age} yaşında)`
                                : '-'}
                        />
                        <InfoItem label="Kilo / Boy" value={`${details?.patientDetails.weight || '-'} kg / ${details?.patientDetails.height || '-'} cm`} />
                        <InfoItem label="E-posta" value={details?.patientDetails.email} />
                        <InfoItem label="Telefon" value={details?.patientDetails.phoneNumber} />
                    </div>
                </div>
                <Separator className="my-6" />

                {details?.status === 'SCHEDULED' ? (
                    <CompleteAppointmentForm
                        appointmentId={appointmentId}
                        onSuccess={onAppointmentComplete}
                    />
                ) : (
                    <div className="text-center p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold">Randevu Tamamlandı</h3>
                        <p className="text-sm text-muted-foreground">Bu randevu için tıbbi kayıt oluşturulmuştur.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

const InfoItem = ({ label, value }: { label: string, value?: string | null }) => (
    <div>
        <p className="text-muted-foreground">{label}</p>
        <p className="font-medium">{value || 'Belirtilmemiş'}</p>
    </div>
);

const CriticalInfoItem = ({ label, value }: { label: string, value?: boolean | null }) => (
    <div>
        <p className="text-muted-foreground">{label}</p>
        <p className={cn(
            "font-bold text-lg",
            value === true ? "text-destructive" : "text-foreground"
        )}>
            {value === true ? 'VAR' : 'YOK'}
        </p>
    </div>
);

const DetailSkeleton = () => (
    <Card>
        <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
        <CardContent className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Separator/>
            <Skeleton className="h-64 w-full" />
        </CardContent>
    </Card>
);
