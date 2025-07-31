'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import React from 'react';
import { useCreateClinic, useClinics } from '@/hooks/useClinicService';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, PlusCircle, Hospital, CheckCircle, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

// Form validasyon şeması
const formSchema = z.object({
    name: z.string().min(2, { message: "Klinik adı en az 2 karakter olmalıdır." }),
});

type FormValues = z.infer<typeof formSchema>;

// Klinik adlandırma rehberi bileşeni
const ClinicNamingGuide = ({ form }: { form: UseFormReturn<FormValues> }) => {
    const validClinicNames = [
        'Algoloji', 'Beyin Cerrahı', 'Kadın Doğum', 'Kadın Hastalıkları', 'Biyokimya',
        'Dahiliye', 'Göğüs Hastalıkları', 'Cildiye', 'Psikiyatri', 'Kardiyoloji',
        'Çocuk Hastalıkları', 'Göz Hastalıkları', 'Fizik Tedavi', 'Nöroloji',
        'Ortopedi', 'Kulak Burun Boğaz', 'Üroloji'
    ];

    return (
        <div>
            <h3 className="text-md font-semibold flex items-center gap-2 text-foreground">
                <Info className="h-5 w-5 text-primary" />
                Adlandırma Rehberi
            </h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
                Mobil uygulama ile tutarlılık için aşağıdaki isimlerden birine tıklayarak kullanabilirsiniz.
            </p>
            <div className="flex flex-wrap gap-2">
                {validClinicNames.map(name => (
                    <Badge
                        key={name}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors"
                        onClick={() => form.setValue('name', name, { shouldValidate: true })}
                    >
                        {name}
                    </Badge>
                ))}
            </div>
        </div>
    );
};

// Son eklenen klinikleri listeleyen bileşen
const RecentlyAddedClinics = () => {
    const { data: clinics, isLoading } = useClinics();

    return (
        <div>
            <h3 className="text-md font-semibold text-foreground mb-4">Son Eklenenler</h3>
            {isLoading ? (
                <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <div className="space-y-3">
                    {clinics && clinics.length > 0 ? (
                        clinics.slice(0, 5).map((clinic) => (
                            <div key={clinic.id} className="flex items-center gap-3 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span className="text-muted-foreground">{clinic.name}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">Henüz klinik eklenmemiş.</p>
                    )}
                </div>
            )}
        </div>
    );
};


export default function CreateClinicPage() {
    const createClinicMutation = useCreateClinic();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "" },
    });

    const onSubmit = (values: FormValues) => {
        createClinicMutation.mutate(values, {
            onSuccess: () => {
                form.reset();
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-6 md:p-8"
        >
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Klinik Yönetimi</h1>
                <p className="mt-1 text-md text-gray-500 dark:text-gray-400">Sisteme yeni klinikler ekleyin ve mevcut olanları yönetin.</p>
            </header>

            <Card className="shadow-lg border-border/20">
                <div className="grid grid-cols-1 lg:grid-cols-3">
                    {/* Sol Taraf: Form */}
                    <div className="lg:col-span-2 p-6 lg:p-8">
                        <CardTitle className="flex items-center gap-2 mb-2">
                            <Hospital className="h-6 w-6" />
                            Yeni Klinik Ekle
                        </CardTitle>
                        <CardDescription className="mb-6">Yeni bir tıbbi birim oluşturmak için adını girin.</CardDescription>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Klinik Adı</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Örn: Kardiyoloji"
                                                    {...field}
                                                    className="h-10"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="submit"
                                        disabled={createClinicMutation.isPending}
                                    >
                                        {createClinicMutation.isPending ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                        )}
                                        Kliniği Oluştur
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>

                    {/* Sağ Taraf: Rehber ve Son Eklenenler */}
                    <div className="lg:col-span-1 bg-muted/30 p-6 lg:p-8 border-t lg:border-t-0 lg:border-l space-y-8">
                        <ClinicNamingGuide form={form} />
                        <Separator />
                        <RecentlyAddedClinics />
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
