'use client';

import {
    AppointmentDetailResponse,
    AppointmentStatus,
    PatientHistoryItem,
    useAppointmentDetails,
    usePatientHistory
} from '@/hooks/doctor/useAppointmentService';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Skeleton} from '@/components/ui/skeleton';
import {Separator} from '@/components/ui/separator';
import {CompleteAppointmentForm} from './CompleteAppointmentForm';
import {AlertCircle, AlertTriangle, CheckCircle, FileText, History, Pill, StickyNote, XCircle} from 'lucide-react';
import {cn} from '@/lib/utils';
import {differenceInYears, format, parseISO} from 'date-fns';
import React, {useState} from "react";
import {Button} from "@/components/ui/button";
// --- YENİ EKLENDİ: Dialog bileşenleri import edildi ---
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog"

interface AppointmentDetailViewProps {
    appointmentId: number | null;
    onAppointmentComplete: () => void;
    onSelectAppointment: (id: number) => void;
}

// --- YENİ BİLEŞEN: Geçmiş randevu detayını dialog içinde gösterir ---
const HistoryDetailDialog = ({ appointmentId, open, onOpenChange }: { appointmentId: number | null, open: boolean, onOpenChange: (open: boolean) => void }) => {
    const { details, isLoading, isError } = useAppointmentDetails(appointmentId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Geçmiş Randevu Detayı</DialogTitle>
                    {details && (
                        <DialogDescription>
                            Tarih: {format(parseISO(details.appointmentTime), 'dd MMMM yyyy, HH:mm')}
                        </DialogDescription>
                    )}
                </DialogHeader>
                <div className="py-4 max-h-[60vh] overflow-y-auto pr-2">
                    {isLoading && <DetailSkeleton />}
                    {isError && <p>Detaylar yüklenirken bir hata oluştu.</p>}
                    {details && <MedicalRecordView details={details} />}
                </div>
            </DialogContent>
        </Dialog>
    )
}


const PatientHistoryList = ({ history, currentAppointmentId, onSelectHistoryItem }: { history: PatientHistoryItem[], currentAppointmentId: number, onSelectHistoryItem: (id: number) => void }) => {
    if (!history || history.length === 0) {
        return <p className="text-sm text-muted-foreground text-center">Hastanın geçmiş tıbbi kaydı bulunmamaktadır.</p>;
    }

    return (
        <div className="space-y-2">
            {history.map(item => (
                <Button
                    key={item.appointmentId}
                    variant={item.appointmentId === currentAppointmentId ? "secondary" : "ghost"}
                    className="w-full h-auto justify-start text-left flex flex-col items-start p-3"
                    onClick={() => onSelectHistoryItem(item.appointmentId)}
                >
                    <p className="font-semibold text-sm">{format(parseISO(item.appointmentTime), 'dd.MM.yyyy - HH:mm')}</p>
                    <p className="text-xs text-muted-foreground font-normal truncate">{item.diagnosis}</p>
                </Button>
            ))}
        </div>
    );
};

const AppointmentStatusInfo = ({ status }: { status?: AppointmentStatus | null }) => {
    let Icon = AlertCircle;
    let title = "Randevu Durumu Belirsiz";
    let description = "Bu randevunun durumu hakkında bilgi bulunamadı.";
    let bgColor = "bg-muted";

    switch (status) {
        case 'COMPLETED':
            Icon = CheckCircle;
            title = "Randevu Tamamlandı";
            description = "Bu randevu için tıbbi kayıt oluşturulmuştur.";
            bgColor = "bg-green-50";
            break;
        case 'CANCELLED':
            Icon = XCircle;
            title = "Randevu İptal Edildi";
            description = "Bu randevu hasta veya sistem tarafından iptal edilmiştir.";
            bgColor = "bg-red-50";
            break;
        case 'MISSED':
            Icon = AlertCircle;
            title = "Randevuya Gelinmedi";
            description = "Hasta bu randevuya katılmamıştır.";
            bgColor = "bg-yellow-50";
            break;
    }

    return (
        <div className={cn("text-center p-4 rounded-lg", bgColor)}>
            <Icon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
};
const MedicalRecordView = ({ details }: { details: AppointmentDetailResponse }) => {
    const record = details.medicalRecord;

    if (!record) {
        return (
            <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="font-semibold">Randevu Tamamlandı</h3>
                <p className="text-sm text-muted-foreground">Bu randevu için tıbbi kayıt bilgisi bulunamadı.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center"><FileText className="mr-2 h-5 w-5" /> Tanı ve Teşhis</h3>
                <p className="text-muted-foreground bg-muted p-3 rounded-md">{record.diagnosis}</p>
            </div>
            {record.notes && (
                <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center"><StickyNote className="mr-2 h-5 w-5" /> Doktor Notları</h3>
                    <p className="text-muted-foreground bg-muted p-3 rounded-md">{record.notes}</p>
                </div>
            )}
            {record.prescriptions && record.prescriptions.length > 0 && (
                <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center"><Pill className="mr-2 h-5 w-5" /> Reçete Edilen İlaçlar</h3>
                    <ul className="space-y-2">
                        {record.prescriptions.map((rx, index) => (
                            <li key={index} className="p-3 bg-muted rounded-md text-sm">
                                <p className="font-semibold">{rx.medicationName}</p>
                                <p className="text-muted-foreground">Dozaj: {rx.dosage} - Süre: {rx.duration}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
const InfoItem = ({ label, value }: { label: string, value?: string | null }) => (
    <div>
        <p className="text-muted-foreground">{label}</p>
        <p className="font-medium">{value || 'Belirtilmemiş'}</p>
    </div>
);
const CriticalInfoItem = ({ label, value }: { label: string, value?: boolean | null }) => (
    <div>
        <p className="text-muted-foreground">{label}</p>
        <p className={cn("font-bold text-lg", value === true ? "text-destructive" : "text-foreground")}>
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


export function AppointmentDetailView({ appointmentId, onAppointmentComplete, onSelectAppointment }: AppointmentDetailViewProps) {
    const { details, isLoading, isError } = useAppointmentDetails(appointmentId);
    const patientId = details?.patientDetails?.id || null;
    const { history, isLoadingHistory } = usePatientHistory(patientId);

    // --- YENİ EKLENDİ: Dialog'u kontrol etmek için state ---
    const [historyDetailId, setHistoryDetailId] = useState<number | null>(null);

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
    if (isError || !details) return <p>Hata: Randevu detayları yüklenemedi.</p>;

    const age = calculateAge(details.patientDetails.dateOfBirth);

    const renderContentByStatus = () => {
        switch (details.status) {
            case 'SCHEDULED':
                return <CompleteAppointmentForm appointmentId={appointmentId} onSuccess={onAppointmentComplete} />;
            case 'COMPLETED':
                return <MedicalRecordView details={details} />;
            case 'CANCELLED':
            case 'MISSED':
                return <AppointmentStatusInfo status={details.status} />;
            default:
                return null;
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="shadow-lg lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-2xl">{details.patientDetails.firstName} {details.patientDetails.lastName}</CardTitle>
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
                                    value={details.patientDetails.hasChronicIllness}
                                />
                                <CriticalInfoItem
                                    label="Sürekli İlaç Kullanımı"
                                    value={details.patientDetails.isMedicationDependent}
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold">Hasta Bilgileri</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <InfoItem
                                    label="Doğum Tarihi"
                                    value={details.patientDetails.dateOfBirth
                                        ? `${format(parseISO(details.patientDetails.dateOfBirth), 'dd.MM.yyyy')} (${age} yaşında)`
                                        : '-'}
                                />
                                <InfoItem label="Kilo / Boy" value={`${details.patientDetails.weight || '-'} kg / ${details.patientDetails.height || '-'} cm`} />
                                <InfoItem label="E-posta" value={details.patientDetails.email} />
                                <InfoItem label="Telefon" value={details.patientDetails.phoneNumber} />
                            </div>
                        </div>
                        <Separator className="my-6" />
                        {renderContentByStatus()}
                    </CardContent>
                </Card>

                <Card className="shadow-lg lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center"><History className="mr-2 h-5 w-5" /> Hasta Geçmişi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingHistory ? (
                            <div className="space-y-2">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : (
                            <PatientHistoryList
                                history={history || []}
                                currentAppointmentId={appointmentId}
                                // --- DEĞİŞİKLİK: Tıklama artık ana görünümü değil, dialog'u tetikliyor ---
                                onSelectHistoryItem={setHistoryDetailId}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* --- YENİ EKLENDİ: Dialog bileşeni render ediliyor --- */}
            <HistoryDetailDialog
                appointmentId={historyDetailId}
                open={!!historyDetailId}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setHistoryDetailId(null);
                    }
                }}
            />
        </>
    );
}
