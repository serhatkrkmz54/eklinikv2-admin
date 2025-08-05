'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Resolver } from "react-hook-form";
import { z } from "zod";
import React, { useEffect } from "react";
import { format } from "date-fns";
import { tr } from 'date-fns/locale';

import { useUserById, useUpdatePatientProfile } from "@/hooks/useUserService";
import { PatientProfileRequest } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { Loader } from "@/components/mycomp/layout/loader";
import { Loader2, ClipboardEdit, CalendarIcon, MapPin, Weight, Ruler, HeartPulse, Pill } from "lucide-react";

const patientEditSchema = z.object({
    dateOfBirth: z.string().nullable().optional(),
    weight: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.coerce.number({ message: "Lütfen geçerli bir sayı girin." }).positive("Kilo 0'dan büyük olmalıdır.").nullable().optional()
    ),
    height: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.coerce.number({ message: "Lütfen geçerli bir sayı girin." }).positive("Boy 0'dan büyük olmalıdır.").nullable().optional()
    ),
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
        resolver: zodResolver(patientEditSchema) as Resolver<PatientEditFormValues>,
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
            <DialogContent className="sm:max-w-2xl bg-slate-50 dark:bg-gray-900 p-8">
                <DialogHeader className="text-center mb-6">
                    <div className="mx-auto bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mb-4">
                        <ClipboardEdit className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <DialogTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Hasta Profilini Güncelle
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 text-md">
                        {user ? `'${user.firstName} ${user.lastName}'` : 'Hasta'} için bilgileri düzenleyin.
                    </DialogDescription>
                </DialogHeader>

                {isUserLoading ? (
                    <div className="h-96 flex items-center justify-center"><Loader text="Profil Yükleniyor..." /></div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* --- Kart 1: Temel Bilgiler --- */}
                            <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border dark:border-slate-700 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Temel Bilgiler</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Doğum Tarihi</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(new Date(field.value), "PPP", { locale: tr })
                                                            ) : (
                                                                <span>Bir tarih seçin</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : null)}
                                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                        initialFocus
                                                        locale={tr} // Türkçe takvim
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="birthPlaceCity" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Doğum Yeri</FormLabel>
                                            <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><FormControl><Input {...field} value={field.value || ''} placeholder="Örn: İstanbul" className="pl-10" /></FormControl></div>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                            </div>

                            <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border dark:border-slate-700 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Fiziksel Özellikler</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="weight" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Kilo (kg)</FormLabel>
                                            <div className="relative"><Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : +e.target.value)} placeholder="Örn: 75" className="pl-10" /></FormControl></div>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="height" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Boy (cm)</FormLabel>
                                            <div className="relative"><Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : +e.target.value)} placeholder="Örn: 180" className="pl-10" /></FormControl></div>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                            </div>

                            <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border dark:border-slate-700 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Tıbbi Geçmiş</h3>
                                <div className="space-y-4">
                                    <FormField control={form.control} name="hasChronicIllness" render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <FormLabel className="font-normal flex items-center gap-2"><HeartPulse className="h-5 w-5 text-red-500" />Kronik Hastalığı Var Mı?</FormLabel>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="isMedicationDependent" render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <FormLabel className="font-normal flex items-center gap-2"><Pill className="h-5 w-5 text-sky-500" />Düzenli İlaç Kullanımı Var Mı?</FormLabel>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}/>
                                </div>
                            </div>

                            <DialogFooter className="pt-6">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
                                <Button type="submit" disabled={updatePatientMutation.isPending} className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                    {updatePatientMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    Değişiklikleri Kaydet
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}