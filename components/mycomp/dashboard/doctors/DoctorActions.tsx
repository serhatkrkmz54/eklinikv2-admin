'use client';

import React, { useState } from 'react';

// Hook'lar ve Tipler
import { useUpdateDoctor, useDeleteDoctor, DoctorResponse, UpdateDoctorRequest } from '@/hooks/useDoctorService';
import { DoctorForm, DoctorFormValues } from './DoctorForm';
// YENİ: Detay dialog bileşeni import edildi.
import { DoctorDetailDialog } from './DoctorDetailDialog';

// UI Bileşenleri
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
// YENİ: Gerekli bileşenler ve ikonlar import edildi.
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Edit, Loader2, Eye } from 'lucide-react';

interface DoctorActionsProps {
    doctor: DoctorResponse;
}

export function DoctorActions({ doctor }: DoctorActionsProps) {
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    // YENİ: Detay penceresinin açık/kapalı durumunu tutan state.
    const [isDetailDialogOpen, setDetailDialogOpen] = useState(false);

    const deleteMutation = useDeleteDoctor();
    const updateMutation = useUpdateDoctor();

    const handleUpdate = (values: DoctorFormValues) => {
        const request: UpdateDoctorRequest = {
            title: values.title,
            clinicId: values.clinicId
        };
        updateMutation.mutate({ id: doctor.doctorId, request }, {
            onSuccess: () => setEditDialogOpen(false)
        });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Menü</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Aksiyonlar</DropdownMenuLabel>

                    {/* YENİ: "Detayları Görüntüle" menü elemanı eklendi. */}
                    <DropdownMenuItem onClick={() => setDetailDialogOpen(true)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Detayları Görüntüle</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Düzenle</span>
                    </DropdownMenuItem>

                    {/* YENİ: Menü elemanlarını ayırmak için Separator eklendi. */}
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Sil</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* YENİ: Detay penceresi bileşeni render ediliyor. */}
            <DoctorDetailDialog
                doctorId={isDetailDialogOpen ? doctor.doctorId : null}
                onOpenChange={setDetailDialogOpen}
            />

            {/* Düzenleme Dialog (Mevcut kod) */}
            <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Doktor Bilgilerini Düzenle</DialogTitle>
                        <DialogDescription>Dr. {doctor.user.firstName} {doctor.user.lastName} bilgilerini güncelleyin.</DialogDescription>
                    </DialogHeader>
                    <DoctorForm
                        isEditMode={true}
                        initialData={{ title: doctor.title, clinicId: doctor.clinic.id }}
                        onSubmit={handleUpdate}
                        isPending={updateMutation.isPending}
                        onClose={() => setEditDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Silme Onay Dialog (Mevcut kod) */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu işlem doktor profilini kalıcı olarak siler ve kullanıcının rolünü HASTA olarak değiştirir. Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate(doctor.doctorId)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Evet, Sil"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
