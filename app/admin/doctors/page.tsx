'use client';

import React, { useState, useMemo } from 'react';
import { useDoctors, useCreateDoctor, DoctorRequest } from '@/hooks/useDoctorService';
import { DoctorForm, DoctorFormValues } from '@/components/mycomp/dashboard/doctors/DoctorForm';
import { DoctorActions } from '@/components/mycomp/dashboard/doctors/DoctorActions';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Building, Stethoscope, Search, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// --- ANA SAYFA BİLEŞENİ (YENİ TASARIM) ---
export default function DoctorManagementPage() {
    const { data: doctors, isLoading, error } = useDoctors();
    const createMutation = useCreateDoctor();
    const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDoctors = useMemo(() => {
        if (!doctors) return [];
        return doctors.filter(doctor =>
            `${doctor.user.firstName} ${doctor.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.clinic.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [doctors, searchTerm]);

    const handleCreate = (values: DoctorFormValues) => {
        if (values.userId === undefined) {
            toast.error("Kullanıcı seçimi zorunludur.");
            return;
        }
        const request: DoctorRequest = {
            userId: values.userId,
            clinicId: values.clinicId,
            title: values.title,
        };
        createMutation.mutate(request, {
            onSuccess: () => {
                toast.success("Doktor başarıyla oluşturuldu!");
                setCreateDialogOpen(false);
            }
        });
    };

    const TableSkeleton = () => (
        <div className="p-4 space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
        </div>
    );

    return (
        // GÜNCELLENDİ: Ana sayfa arka planı ve padding
        <main className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
            <div className="w-full mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Doktor Yönetimi</h1>
                        <p className="text-slate-600 mt-1">Sistemdeki doktorları görüntüleyin, oluşturun ve yönetin.</p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm"><UserPlus className="mr-2 h-4 w-4" />Yeni Doktor Oluştur</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-2xl">Yeni Doktor Oluştur</DialogTitle>
                                <DialogDescription>Mevcut bir kullanıcıyı doktor rolüne atamak için aşağıdaki formu doldurun.</DialogDescription>
                            </DialogHeader>
                            <DoctorForm
                                onSubmit={handleCreate}
                                isPending={createMutation.isPending}
                                onClose={() => setCreateDialogOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                {/* YENİ: Ana içerik kartı */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="p-4 border-b border-slate-200">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                placeholder="Doktor, unvan veya klinikte ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 h-10"
                            />
                        </div>
                    </div>
                    {isLoading ? <TableSkeleton /> : error ? (
                        <div className="flex flex-col items-center justify-center p-8 gap-3 text-center">
                            <AlertCircle className="h-12 w-12 text-red-400" />
                            <h3 className="text-lg font-semibold text-red-600">Bir Hata Oluştu</h3>
                            <p className="text-red-500 text-sm">Doktor verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="font-semibold">Doktor</TableHead>
                                    <TableHead className="font-semibold">Unvan</TableHead>
                                    <TableHead className="font-semibold">Klinik</TableHead>
                                    <TableHead className="text-right font-semibold">Aksiyonlar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDoctors.length > 0 ? filteredDoctors.map(doctor => (
                                    <TableRow key={doctor.doctorId} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback className="bg-slate-200 text-slate-600">
                                                        {doctor.user.firstName[0]}{doctor.user.lastName[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-semibold text-slate-800">{doctor.user.firstName} {doctor.user.lastName}</div>
                                                    <div className="text-xs text-slate-500">{doctor.user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="flex items-center gap-2 max-w-max text-sky-700 border-sky-200 bg-sky-50">
                                                <Stethoscope className="h-4 w-4" /> {doctor.title}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="flex items-center gap-2 max-w-max">
                                                <Building className="h-4 w-4" /> {doctor.clinic.name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DoctorActions doctor={doctor} />
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                                            Arama kriterlerinize uygun doktor bulunamadı.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </main>
    );
}