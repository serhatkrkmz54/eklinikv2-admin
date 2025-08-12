'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCompleteAppointment } from '@/hooks/doctor/useAppointmentService';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';

const prescriptionSchema = z.object({
    medicationName: z.string().min(1, "İlaç adı boş olamaz."),
    dosage: z.string().min(1, "Dozaj boş olamaz."),
    duration: z.string().min(1, "Süre boş olamaz."),
});

const completeFormSchema = z.object({
    diagnosis: z.string().min(3, "Teşhis en az 3 karakter olmalıdır."),
    notes: z.string().optional(),
    prescriptions: z.array(prescriptionSchema).optional(),
});

type CompleteFormValues = z.infer<typeof completeFormSchema>;

interface CompleteAppointmentFormProps {
    appointmentId: number;
    onSuccess: () => void;
}

export function CompleteAppointmentForm({ appointmentId, onSuccess }: CompleteAppointmentFormProps) {
    const { completeAppointment, isCompleting } = useCompleteAppointment(appointmentId);
    const form = useForm<CompleteFormValues>({
        resolver: zodResolver(completeFormSchema),
        defaultValues: { diagnosis: '', notes: '', prescriptions: [] },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "prescriptions",
    });

    const onSubmit = async (values: CompleteFormValues) => {
        await completeAppointment(values);
        onSuccess();
    };

    return (
        <div className="space-y-4">
            <h3 className="font-semibold">Tıbbi Kayıt Oluştur</h3>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="diagnosis" render={({ field }) => (
                        <FormItem><FormLabel>Teşhis</FormLabel><FormControl><Input placeholder="Örn: Akut Faranjit" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="notes" render={({ field }) => (
                        <FormItem><FormLabel>Doktor Notları</FormLabel><FormControl><Textarea placeholder="Hastanın durumu hakkında ek notlar..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Reçete</h4>
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ medicationName: '', dosage: '', duration: '' })}>
                                <PlusCircle className="h-4 w-4 mr-2" /> İlaç Ekle
                            </Button>
                        </div>
                        <Separator />
                        <div className="space-y-4 mt-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-start">
                                    <FormField control={form.control} name={`prescriptions.${index}.medicationName`} render={({ field }) => (
                                        <FormItem className="sm:col-span-3"><FormLabel className="text-xs">İlaç Adı</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`prescriptions.${index}.dosage`} render={({ field }) => (
                                        <FormItem className="sm:col-span-2"><FormLabel className="text-xs">Dozaj</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`prescriptions.${index}.duration`} render={({ field }) => (
                                        <FormItem className="sm:col-span-1"><FormLabel className="text-xs">Süre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mt-6"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isCompleting} className="min-w-[200px]">
                            {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Randevuyu Tamamla ve Kaydet
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
