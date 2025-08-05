'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { useEffect } from "react";
import { useUserById, useUpdateUser } from "@/hooks/useUserService";
import { UpdateUserRequest } from "@/hooks/useUserProfile";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Loader2, User, Mail, Phone, ShieldCheck, Stethoscope, HeartPulse } from "lucide-react";

// --- Form Şeması (Değişiklik yok) ---
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

const IconInput = React.forwardRef<HTMLInputElement, { icon: React.ElementType } & React.InputHTMLAttributes<HTMLInputElement>>(({ icon: Icon, ...props }, ref) => (
    <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input ref={ref} className="pl-10" {...props} />
    </div>
));
IconInput.displayName = 'IconInput';

const EditFormSkeleton = () => (
    <div className="space-y-6 py-4">
        <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
            <div className="md:col-span-2 space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-12" /><Skeleton className="h-10 w-full" /></div>
        </div>
    </div>
);


export function UserEditDialog({ userId, onOpenChange }: UserEditDialogProps) {
    const { data: user, isLoading: isUserLoading } = useUserById(userId);
    const updateUserMutation = useUpdateUser();

    const form = useForm<EditFormValues>({
        resolver: zodResolver(editFormSchema),
        defaultValues: { firstName: '', lastName: '', email: '', phoneNumber: '', role: undefined }
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
        const payload: UpdateUserRequest = { ...values, phoneNumber: values.phoneNumber.replace(/\s/g, '') };
        updateUserMutation.mutate({ id: userId!, userData: payload }, {
            onSuccess: () => onOpenChange(false)
        });
    };

    return (
        <Dialog open={!!userId} onOpenChange={onOpenChange}>
            {/* Sadeleştirilmiş DialogContent, gereksiz stiller kaldırıldı */}
            <DialogContent className="sm:max-w-2xl p-0">
                <VisuallyHidden asChild>
                    <DialogHeader>
                        <DialogTitle>Kullanıcı Bilgilerini Düzenle</DialogTitle>
                        <DialogDescription>
                            Bu formu kullanarak seçili kullanıcının temel profil bilgilerini güncelleyebilirsiniz.
                        </DialogDescription>
                    </DialogHeader>
                </VisuallyHidden>

                {isUserLoading ? (
                    <div className="p-6"><EditFormSkeleton /></div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            {/* Temiz Başlık Alanı */}
                            <div className="p-6 pb-4 bg-muted/50 rounded-t-lg border-b">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarFallback className="text-xl">
                                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="text-2xl font-semibold tracking-tight">Kullanıcıyı Düzenle</h2>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold text-primary">{user?.firstName} {user?.lastName}</span> adlı kullanıcı.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Bol Boşluklu ve Okunaklı Form Alanı */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                                <FormField control={form.control} name="firstName" render={({ field }) => (
                                    <FormItem><FormLabel>İsim</FormLabel><FormControl><IconInput icon={User} {...field} placeholder="Kullanıcının adı" /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="lastName" render={({ field }) => (
                                    <FormItem><FormLabel>Soyisim</FormLabel><FormControl><IconInput icon={User} {...field} placeholder="Kullanıcının soyadı" /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem className="md:col-span-2"><FormLabel>E-posta Adresi</FormLabel><FormControl><IconInput icon={Mail} {...field} placeholder="ornek@adres.com"/></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                                    <FormItem><FormLabel>Telefon Numarası</FormLabel><FormControl><IconInput icon={Phone} {...field} placeholder="5XX XXX XX XX" /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="role" render={({ field }) => (
                                    <FormItem><FormLabel>Rol</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Bir rol seçin..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ROLE_ADMIN"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-muted-foreground"/> Admin</div></SelectItem>
                                                <SelectItem value="ROLE_DOCTOR"><div className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-muted-foreground"/> Doktor</div></SelectItem>
                                                <SelectItem value="ROLE_PATIENT"><div className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-muted-foreground"/> Hasta</div></SelectItem>
                                            </SelectContent>
                                        </Select><FormMessage />
                                    </FormItem>
                                )}/>
                            </div>

                            {/* Temiz Alt Bilgi ve Butonlar */}
                            <DialogFooter className="p-6 pt-4 bg-muted/50 rounded-b-lg border-t">
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