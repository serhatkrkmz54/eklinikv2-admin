'use client';

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAvailableUsers, useClinics } from '@/hooks/useDoctorService';
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';

const doctorFormSchema = z.object({
    userId: z.number().optional(),
    clinicId: z.number({ message: "Lütfen bir klinik seçin." }),
    title: z.string().min(2, "Unvan en az 2 karakter olmalıdır.").max(50, "Unvan en fazla 50 karakter olabilir."),
});

export type DoctorFormValues = z.infer<typeof doctorFormSchema>;

interface DoctorFormProps {
    initialData?: Partial<DoctorFormValues>;
    onSubmit: (values: DoctorFormValues) => void;
    isPending: boolean;
    onClose: () => void;
    isEditMode?: boolean;
}

export function DoctorForm({ initialData, onSubmit, isPending, onClose, isEditMode = false }: DoctorFormProps) {
    const form = useForm<DoctorFormValues>({
        resolver: zodResolver(doctorFormSchema.refine(data => isEditMode || data.userId !== undefined, {
            message: "Lütfen bir kullanıcı seçin.",
            path: ["userId"],
        })),
        defaultValues: initialData || { title: '', userId: undefined, clinicId: undefined },
    });

    const [userPopoverOpen, setUserPopoverOpen] = useState(false);
    const [clinicPopoverOpen, setClinicPopoverOpen] = useState(false);

    const { data: users, isLoading: usersLoading } = useAvailableUsers();
    const { data: clinics, isLoading: clinicsLoading } = useClinics();

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
                {!isEditMode && (
                    <FormField
                        control={form.control}
                        name="userId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kullanıcı</FormLabel>
                                <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                                                {field.value ? users?.find(u => u.id === field.value)?.firstName + ' ' + users?.find(u => u.id === field.value)?.lastName : "Bir kullanıcı seçin..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Kullanıcı ara (isim/e-posta)..." />
                                            <CommandList>
                                                {usersLoading && <div className="p-4 text-sm text-center">Yükleniyor...</div>}
                                                <CommandEmpty>Uygun kullanıcı bulunamadı.</CommandEmpty>
                                                <CommandGroup>
                                                    {users?.map((user) => (
                                                        <CommandItem
                                                            value={`${user.firstName} ${user.lastName} ${user.email}`}
                                                            key={user.id}
                                                            onSelect={() => {
                                                                form.setValue("userId", user.id, { shouldValidate: true });
                                                                setUserPopoverOpen(false);
                                                            }}
                                                        >
                                                            <Check className={`mr-2 h-4 w-4 ${field.value === user.id ? "opacity-100" : "opacity-0"}`} />
                                                            {user.firstName} {user.lastName} <span className="text-xs text-muted-foreground ml-2">({user.email})</span>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                <FormField
                    control={form.control}
                    name="clinicId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Klinik</FormLabel>
                            <Popover open={clinicPopoverOpen} onOpenChange={setClinicPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                                            {field.value ? clinics?.find(c => c.id === field.value)?.name : "Bir klinik seçin..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Klinik ara..." />
                                        <CommandList>
                                            {clinicsLoading && <div className="p-4 text-sm text-center">Yükleniyor...</div>}
                                            <CommandEmpty>Klinik bulunamadı.</CommandEmpty>
                                            <CommandGroup>
                                                {clinics?.map((clinic) => (
                                                    <CommandItem
                                                        value={clinic.name}
                                                        key={clinic.id}
                                                        // GÜNCELLENDİ: Seçim yapıldığında popover'ı kapat
                                                        onSelect={() => {
                                                            form.setValue("clinicId", clinic.id, { shouldValidate: true });
                                                            setClinicPopoverOpen(false); // Popover'ı kapat
                                                        }}
                                                    >
                                                        <Check className={`mr-2 h-4 w-4 ${field.value === clinic.id ? "opacity-100" : "opacity-0"}`} />
                                                        {clinic.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Unvan</FormLabel>
                            <FormControl>
                                <Input placeholder="Örn: Prof. Dr., Uzm. Dr." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter className="pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>İptal</Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? "Değişiklikleri Kaydet" : "Doktor Oluştur"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}