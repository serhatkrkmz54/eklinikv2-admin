'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { useEffect } from "react";
import { useUserById, useUpdatePatientProfile} from "@/hooks/useUserService";
import { PatientProfileRequest } from "@/hooks/useUserProfile"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader } from "@/components/mycomp/layout/loader";
import { Loader2 } from "lucide-react";

const patientEditSchema = z.object({
    dateOfBirth: z.string().nullable().optional(),
    weight: z.number().nullable().optional(),
    height: z.number().nullable().optional(),
    birthPlaceCity: z.string().nullable().optional(),
    hasChronicIllness: z.boolean().optional(),
    isMedicationDependent: z.boolean().optional(),
    address: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
});

type PatientEditFormValues = z.infer<typeof patientEditSchema>;

interface PatientEditDialogProps {
    userId: number | null;
    onOpenChange: (open: boolean) => void;
}

export function PatientEditDialog({ userId, onOpenChange }: PatientEditDialogProps) {
    const { data: user, isLoading: isUserLoading } = useUserById(userId);
    const updatePatientMutation = useUpdatePatientProfile();

    const form = useForm<PatientEditFormValues>({
        resolver: zodResolver(patientEditSchema),
        defaultValues: {
            dateOfBirth: null,
            weight: null,
            height: null,
            birthPlaceCity: null,
            hasChronicIllness: false,
            isMedicationDependent: false,
            address: null,
            country: null,
        },
    });

    useEffect(() => {
        if (user?.patientProfile) {
            form.reset({
                dateOfBirth: user.patientProfile.dateOfBirth ?? null,
                weight: user.patientProfile.weight ?? null,
                height: user.patientProfile.height ?? null,
                birthPlaceCity: user.patientProfile.birthPlaceCity ?? null,
                hasChronicIllness: user.patientProfile.hasChronicIllness ?? false,
                isMedicationDependent: user.patientProfile.isMedicationDependent ?? false,
                address: user.patientProfile.address ?? null,
                country: user.patientProfile.country ?? null,
            });
        }
    }, [user, form]);

    const onSubmit = (values: PatientEditFormValues) => {
        const payload: PatientProfileRequest = { ...values };
        updatePatientMutation.mutate({ userId: userId!, profileData: payload }, {
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={!!userId} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Hasta Profilini Düzenle</DialogTitle>
                    <DialogDescription>
                        {user ? `'${user.firstName} ${user.lastName}'` : 'Hasta'} adlı hastanın tıbbi profilini güncelleyin.
                    </DialogDescription>
                </DialogHeader>
                {isUserLoading ? (
                    <div className="h-64 flex items-center justify-center"><Loader text="Profil Yükleniyor..." /></div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                                    <FormItem><FormLabel>Doğum Tarihi (YYYY-AA-GG)</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="birthPlaceCity" render={({ field }) => (
                                    <FormItem><FormLabel>Doğum Yeri</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="weight" render={({ field }) => (
                                    <FormItem><FormLabel>Kilo (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="height" render={({ field }) => (
                                    <FormItem><FormLabel>Boy (cm)</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="hasChronicIllness" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel>Kronik Hastalık Var Mı?</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                                )}/>
                                <FormField control={form.control} name="isMedicationDependent" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel>İlaç Bağımlılığı Var Mı?</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                                )}/>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
                                <Button type="submit" disabled={updatePatientMutation.isPending}>
                                    {updatePatientMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    Profili Kaydet
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}