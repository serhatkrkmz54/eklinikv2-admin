'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { useEffect } from "react";
import { useUserById, useUpdateUser } from "@/hooks/useUserService";
import { UpdateUserRequest } from "@/hooks/useUserProfile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader } from "@/components/mycomp/layout/loader";
import { Loader2 } from "lucide-react";

const editFormSchema = z.object({
    firstName: z.string().min(1, "İsim boş olamaz."),
    lastName: z.string().min(1, "Soyisim boş olamaz."),
    email: z.string().email("Geçerli bir e-posta adresi giriniz."),
    phoneNumber: z.string().min(1, "Telefon numarası boş olamaz."),
    role: z.enum(["ROLE_PATIENT", "ROLE_DOCTOR", "ROLE_ADMIN"]),
});

type EditFormValues = z.infer<typeof editFormSchema>;

interface UserEditDialogProps {
    userId: number | null;
    onOpenChange: (open: boolean) => void;
}

export function UserEditDialog({ userId, onOpenChange }: UserEditDialogProps) {
    const { data: user, isLoading: isUserLoading } = useUserById(userId);
    const updateUserMutation = useUpdateUser();

    const form = useForm<EditFormValues>({
        resolver: zodResolver(editFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            role: undefined,
        }
    });

    useEffect(() => {
        if (user) {
            form.reset({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                role: user.role,
            });
        }
    }, [user, form]);

    const onSubmit = (values: EditFormValues) => {
        const payload: UpdateUserRequest = {
            ...values,
            phoneNumber: values.phoneNumber.replace(/\s/g, '')
        };
        updateUserMutation.mutate({ id: userId!, userData: payload }, {
            onSuccess: () => {
                onOpenChange(false);
            }
        });
    };

    return (
        <Dialog open={!!userId} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Kullanıcıyı Düzenle</DialogTitle>
                    <DialogDescription>
                        {user ? `'${user.firstName} ${user.lastName}'` : 'Kullanıcı'} adlı kullanıcının bilgilerini güncelleyin.
                    </DialogDescription>
                </DialogHeader>
                {isUserLoading ? (
                    <div className="h-64 flex items-center justify-center"><Loader text="Veriler Yükleniyor..." /></div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="firstName" render={({ field }) => (
                                    <FormItem><FormLabel>İsim</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="lastName" render={({ field }) => (
                                    <FormItem><FormLabel>Soyisim</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem className="md:col-span-2"><FormLabel>E-posta</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                                    <FormItem><FormLabel>Telefon Numarası</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rol</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Bir rol seçin..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
                                                    <SelectItem value="ROLE_DOCTOR">Doktor</SelectItem>
                                                    <SelectItem value="ROLE_PATIENT">Hasta</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
                                <Button type="submit" disabled={updateUserMutation.isPending}>
                                    {updateUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
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