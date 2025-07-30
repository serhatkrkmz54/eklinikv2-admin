'use client';

import { useUserById } from '@/hooks/useUserService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader } from '@/components/mycomp/layout/loader';
import { Badge } from '@/components/ui/badge';
import {
    User,
    Mail,
    Phone,
    Fingerprint,
    Calendar,
    ShieldCheck,
    Stethoscope,
    HeartPulse,
    Scale,
    Activity,
    MapPin,
    Globe,
    Pill,
    Building
} from 'lucide-react';
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";

interface PatientProfileResponse {
    dateOfBirth: string | null;
    weight: number | null;
    height: number | null;
    hasChronicIllness: boolean;
    isMedicationDependent: boolean;
    birthPlaceCity: string | null;
    birthPlaceDistrict: string | null;
    address: string | null;
    country: string | null;
}

interface UserResponse {
    id: number;
    nationalId: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: "ROLE_PATIENT" | "ROLE_DOCTOR" | "ROLE_ADMIN";
    createdAt: string;
    patientProfile: PatientProfileResponse | null;
}

const roleConfig: { [key: string]: { label: string; icon: React.ElementType; className: string; } } = {
    ROLE_ADMIN: { label: "Admin", icon: ShieldCheck, className: "text-red-600 dark:text-red-400" },
    ROLE_DOCTOR: { label: "Doktor", icon: Stethoscope, className: "text-sky-600 dark:text-sky-400" },
    ROLE_PATIENT: { label: "Hasta", icon: HeartPulse, className: "text-green-600 dark:text-green-400" }
};

interface UserDetailDialogProps {
    userId: number | null;
    onOpenChange: (open: boolean) => void;
}

const DetailItem = ({ icon: Icon, label, value, unit = '' }: { icon: React.ElementType; label: string; value?: string | number | null | boolean; unit?: string; }) => {
    let displayValue: React.ReactNode = <span className="text-sm text-muted-foreground italic">Belirtilmemiş</span>;

    if (typeof value === 'boolean') {
        displayValue = value ? "Var" : "Yok";
    } else if (value !== null && value !== undefined && value !== '') {
        displayValue = `${value}${unit}`;
    }

    return (
        <div className="flex items-center gap-3 text-sm">
            <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground min-w-[120px]">{label}:</span>
            <span className="font-semibold text-foreground break-all">{displayValue}</span>
        </div>
    );
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-md font-semibold text-foreground mb-4">{children}</h3>
);

export function UserDetailDialog({ userId, onOpenChange }: UserDetailDialogProps) {
    // Düzeltme: UserResponse tipini hook'a belirtiyoruz.
    const { data: user, isLoading, error } = useUserById(userId);
    const getRoleDetails = (role: string) => roleConfig[role] || { label: role, icon: User, className: "text-muted-foreground" };

    return (
        <Dialog open={!!userId} onOpenChange={onOpenChange}>
            {/* DEĞİŞİKLİK 1: Dialog genişliği artırıldı */}
            <DialogContent className="sm:max-w-4xl p-0">
                <VisuallyHidden asChild>
                    <DialogHeader>
                        <DialogTitle>
                            {user ? `${user.firstName} ${user.lastName} Kullanıcı Detayları` : "Kullanıcı Detayı Yükleniyor"}
                        </DialogTitle>
                        <DialogDescription>
                            Kullanıcının kişisel, tıbbi ve adres bilgileri.
                        </DialogDescription>
                    </DialogHeader>
                </VisuallyHidden>

                {isLoading && <div className="h-[500px] flex items-center justify-center"><Loader text="Kullanıcı Bilgileri Yükleniyor..." /></div>}
                {error && <div className="h-[500px] flex items-center justify-center text-red-500">Kullanıcı bilgileri yüklenemedi.</div>}

                {user && (
                    // DEĞİŞİKLİK 2: Kapatma butonu için üst padding eklendi
                    <div className="flex flex-col md:flex-row pt-4 md:pt-0">
                        {/* SOL BİLGİ KARTI */}
                        <aside className="w-full md:w-1/3 bg-muted/50 p-6 border-b md:border-r md:border-b-0 flex flex-col items-center text-center">
                            {React.createElement(getRoleDetails(user.role).icon, { className: `h-20 w-20 mb-4 ${getRoleDetails(user.role).className}` })}
                            <h2 className="text-xl font-bold text-foreground">{user.firstName} {user.lastName}</h2>
                            <p className="text-muted-foreground text-sm">{getRoleDetails(user.role).label}</p>
                            <Badge variant="outline" className="mt-4">Aktif</Badge>
                            <Separator className="my-6" />
                            <div className="space-y-4 text-left w-full text-sm">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    {/* DEĞİŞİKLİK 3: Uzun e-posta adreslerinin taşmasını engellemek için `break-all` eklendi */}
                                    <span className="text-foreground break-all">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="text-foreground">{user.phoneNumber}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="text-foreground">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</span>
                                </div>
                            </div>
                        </aside>

                        {/* SAĞ DETAY ALANI */}
                        <main className="w-full md:w-2/3 p-6 md:p-8 md:pt-14 space-y-6 max-h-[80vh] overflow-y-auto">
                            <Card>
                                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Fingerprint className="h-5 w-5"/>Kimlik Bilgileri</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    <DetailItem icon={User} label="T.C. Kimlik No" value={user.nationalId} />
                                    {user.patientProfile && (
                                        <>
                                            <DetailItem icon={Calendar} label="Doğum Tarihi" value={user.patientProfile.dateOfBirth ? new Date(user.patientProfile.dateOfBirth).toLocaleDateString('tr-TR') : null} />
                                            <DetailItem
                                                icon={MapPin}
                                                label="Doğum Yeri"
                                                value={[user.patientProfile.birthPlaceCity, user.patientProfile.birthPlaceDistrict].filter(Boolean).join(' / ')}
                                            />
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {user.role === 'ROLE_PATIENT' && user.patientProfile && (
                                <Card>
                                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><HeartPulse className="h-5 w-5"/>Tıbbi Profil</CardTitle></CardHeader>
                                    <CardContent className="space-y-3">
                                        <DetailItem icon={Scale} label="Kilo" value={user.patientProfile.weight} unit=" kg" />
                                        <DetailItem icon={Activity} label="Boy" value={user.patientProfile.height} unit=" cm" />
                                        <DetailItem icon={Pill} label="İlaç Bağımlılığı" value={user.patientProfile.isMedicationDependent} />
                                        <DetailItem icon={HeartPulse} label="Kronik Hastalık" value={user.patientProfile.hasChronicIllness} />
                                    </CardContent>
                                </Card>
                            )}

                            {user.role === 'ROLE_PATIENT' && user.patientProfile && (
                                <Card>
                                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5"/>Adres Bilgileri</CardTitle></CardHeader>
                                    <CardContent className="space-y-3">
                                        <DetailItem icon={MapPin} label="Adres" value={user.patientProfile.address} />
                                        <DetailItem icon={Building} label="Ülke" value={user.patientProfile.country} />
                                    </CardContent>
                                </Card>
                            )}
                        </main>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}