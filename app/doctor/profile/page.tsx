'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useMyProfile, useUpdateMyProfile } from '@/hooks/doctor/useProfileService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
// YENİ: Gerekli ikonlar import edildi
import { Loader2, UserCog, Briefcase, User, Mail, Phone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import React from 'react';

// Form validasyon şeması
const profileFormSchema = z.object({
    firstName: z.string().min(3, 'İsim en az 3 karakter olmalıdır.'),
    lastName: z.string().min(3, 'Soyisim en az 3 karakter olmalıdır.'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
    phoneNumber: z.string().regex(/^\+90\d{10}$/, "Telefon numarası '+905xxxxxxxxx' formatında olmalıdır."),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// YENİ: Yeniden kullanılabilir ikonlu input bileşeni
const IconInput = React.forwardRef<HTMLInputElement, { icon: React.ElementType } & React.InputHTMLAttributes<HTMLInputElement>>(({ icon: Icon, ...props }, ref) => (
    <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input ref={ref} className="pl-10" {...props} />
    </div>
));
IconInput.displayName = 'IconInput';


export default function ProfileSettingsPage() {
    const { profile, isLoading, mutate } = useMyProfile();
    const { updateProfile, isUpdating } = useUpdateMyProfile();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: { firstName: '', lastName: '', email: '', phoneNumber: '' },
    });

    useEffect(() => {
        if (profile) {
            form.reset({
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                phoneNumber: profile.phoneNumber,
            });
        }
    }, [profile, form]);

    const onSubmit = async (values: ProfileFormValues) => {
        await updateProfile(values);
        mutate();
    };

    if (isLoading) return <ProfileSkeleton />;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <UserCog className="h-7 w-7 text-primary" />
                    Profil Ayarları
                </h1>
                <p className="text-muted-foreground mt-1">
                    Kişisel bilgilerinizi görüntüleyebilir ve güncelleyebilirsiniz.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                <Card className="lg:col-span-2 shadow-lg border border-border/60">
                    <CardHeader>
                        <CardTitle className="text-xl">Kişisel Bilgiler</CardTitle>
                        <CardDescription>
                            İletişim bilgilerinizi buradan güncelleyebilirsiniz.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="firstName" render={({ field }) => (
                                        <FormItem><FormLabel>İsim</FormLabel><FormControl><IconInput icon={User} {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="lastName" render={({ field }) => (
                                        <FormItem><FormLabel>Soyisim</FormLabel><FormControl><IconInput icon={User} {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>E-posta</FormLabel><FormControl><IconInput icon={Mail} type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                                    <FormItem><FormLabel>Telefon Numarası</FormLabel><FormControl><IconInput icon={Phone} {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={isUpdating} className="min-w-[180px]">
                                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Bilgileri Güncelle
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <div className="lg:col-span-1 space-y-8">
                    <Card className="shadow-lg border border-border/60">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback className="text-xl bg-primary/10 text-primary font-semibold">
                                    {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{profile?.firstName} {profile?.lastName}</CardTitle>
                                <CardDescription>{profile?.email}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {profile?.doctorInfo && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pt-2">
                                        <Briefcase className="h-5 w-5 text-primary" />
                                        <h3 className="text-lg font-semibold">Mesleki Bilgiler</h3>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Unvan</label>
                                        <p className="text-muted-foreground">{profile.doctorInfo.title}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Klinik</label>
                                        <p className="text-muted-foreground">{profile.doctorInfo.clinicName}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Yüklenme iskeleti
const ProfileSkeleton = () => (
    <div className="space-y-8">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-72 mt-2" />
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
                    </div>
                    <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                    <div className="flex justify-end"><Skeleton className="h-10 w-44" /></div>
                </CardContent>
            </Card>
            <Card className="lg:col-span-1">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-40" /></div>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        </div>
    </div>
);
