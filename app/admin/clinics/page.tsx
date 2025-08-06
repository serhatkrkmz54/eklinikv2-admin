'use client';

import React, {useState} from 'react';
import {ClinicResponse, useClinics, useCreateClinic, useDeleteClinic} from '@/hooks/useClinicService';
import {AnimatePresence, motion} from 'framer-motion';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import Link from 'next/link';

import {Button} from '@/components/ui/button';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import {Loader} from "@/components/mycomp/layout/loader";
import {ClinicEditDialog} from '@/components/mycomp/dashboard/clinics/ClinicEditDialog';
import {ConfirmationDialog} from '@/components/mycomp/dashboard/users/ConfirmationDialog';
import {ArrowRight, Hospital, Loader2, MoreHorizontal, Pencil, PlusCircle, Stethoscope, Trash2} from 'lucide-react';

const formSchema = z.object({
    name: z.string().min(2, { message: "Klinik adı en az 2 karakter olmalıdır." }),
});
type FormValues = z.infer<typeof formSchema>;

const CreateClinicForm = () => {
    const createClinicMutation = useCreateClinic();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "" },
    });

    const onSubmit = (values: FormValues) => {
        createClinicMutation.mutate(values, {
            onSuccess: () => form.reset(),
        });
    };

    const validClinicNames = ['Algoloji', 'Beyin Cerrahı', 'Kadın Doğum', 'Biyokimya', 'Dahiliye', 'Cildiye', 'Psikiyatri', 'Kardiyoloji', 'Nöroloji', 'Ortopedi', 'Üroloji'];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><PlusCircle className="h-5 w-5"/>Yeni Klinik Ekle</CardTitle>
                <CardDescription>Sisteme yeni bir tıbbi birim ekleyin.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Klinik Adı</FormLabel>
                                    <FormControl><Input placeholder="Örn: Kardiyoloji" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="pt-2">
                            <h4 className="text-sm font-medium mb-2">Önerilen İsimler</h4>
                            <div className="flex flex-wrap gap-2">
                                {validClinicNames.map(name => (
                                    <Badge key={name} variant="outline" className="cursor-pointer" onClick={() => form.setValue('name', name, { shouldValidate: true })}>{name}</Badge>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={createClinicMutation.isPending}>
                                {createClinicMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                Kliniği Oluştur
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

const NextStepGuide = () => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><ArrowRight className="h-5 w-5"/>Sonraki Adım</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
                Klinik oluşturduktan sonra, bu kliniğe doktor ataması yapmak için Doktor Yönetimi sayfasına gidin.
            </p>
            <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/admin/doctors"><Stethoscope className="mr-2 h-4 w-4" />Doktor Yönetimine Git</Link>
            </Button>
        </CardContent>
    </Card>
);

export default function ClinicsPage() {
    const { data: clinics, isLoading, error } = useClinics();
    const deleteClinicMutation = useDeleteClinic();

    const [clinicToEdit, setClinicToEdit] = useState<ClinicResponse | null>(null);
    const [clinicToDelete, setClinicToDelete] = useState<ClinicResponse | null>(null);

    if (isLoading) {
        return <div className="flex h-[80vh] items-center justify-center"><Loader size="lg" text="Klinikler Yükleniyor..." /></div>;
    }
    if (error) {
        return <div className="p-8 text-red-500">Hata: {error.message}</div>;
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-6 md:p-8"
            >
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Klinik Yönetimi</h1>
                    <p className="mt-1 text-md text-muted-foreground">Sistemdeki tüm klinikleri görüntüleyin, oluşturun ve yönetin.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tüm Klinikler</CardTitle>
                                <CardDescription>Mevcut tüm tıbbi birimler listelenmektedir.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[80px] font-semibold">ID</TableHead>
                                                <TableHead className="font-semibold">Klinik Adı</TableHead>
                                                <TableHead className="text-right font-semibold">İşlemler</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <AnimatePresence>
                                                {clinics && clinics.length > 0 ? (
                                                    clinics.map((clinic) => (
                                                        <motion.tr key={clinic.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                            <TableCell className="font-mono text-muted-foreground">#{clinic.id}</TableCell>
                                                            <TableCell className="font-medium flex items-center gap-2">
                                                                <Hospital className="h-4 w-4 text-primary" />
                                                                {clinic.name}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onSelect={() => setClinicToEdit(clinic)}><Pencil className="mr-2 h-4 w-4"/> Düzenle</DropdownMenuItem>
                                                                        <DropdownMenuItem className="text-red-500 focus:text-red-500" onSelect={() => setClinicToDelete(clinic)}><Trash2 className="mr-2 h-4 w-4"/> Sil</DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </motion.tr>
                                                    ))
                                                ) : (
                                                    <TableRow><TableCell colSpan={3} className="text-center h-24">Henüz hiç klinik oluşturulmamış.</TableCell></TableRow>
                                                )}
                                            </AnimatePresence>
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                        <CreateClinicForm />
                        <NextStepGuide />
                    </div>
                </div>
            </motion.div>

            <ClinicEditDialog
                clinic={clinicToEdit}
                onOpenChange={(open) => !open && setClinicToEdit(null)}
            />
            <ConfirmationDialog
                isOpen={!!clinicToDelete}
                onClose={() => setClinicToDelete(null)}
                onConfirm={() => {
                    if (clinicToDelete) deleteClinicMutation.mutate(clinicToDelete.id);
                }}
                title={`'${clinicToDelete?.name}' Kliniği Silinecek`}
                description="Bu işlem geri alınamaz. Bu kliniği kalıcı olarak silmek istediğinizden emin misiniz?"
            />
        </>
    );
}
