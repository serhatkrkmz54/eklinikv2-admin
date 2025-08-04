'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { useEffect } from "react";
import { useUpdateClinic } from "@/hooks/useClinicService";
import { ClinicResponse } from "@/hooks/useClinicService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(2, "Klinik adı en az 2 karakter olmalıdır."),
});
type FormValues = z.infer<typeof formSchema>;

interface ClinicEditDialogProps {
    clinic: ClinicResponse | null;
    onOpenChange: (open: boolean) => void;
}

export function ClinicEditDialog({ clinic, onOpenChange }: ClinicEditDialogProps) {
    const updateClinicMutation = useUpdateClinic();
    const form = useForm<FormValues>({ resolver: zodResolver(formSchema) });

    useEffect(() => {
        if (clinic) {
            form.reset({ name: clinic.name });
        }
    }, [clinic, form]);

    const onSubmit = (values: FormValues) => {
        if (!clinic) return;
        updateClinicMutation.mutate({ id: clinic.id, clinicData: values }, {
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={!!clinic} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Kliniği Düzenle</DialogTitle>
                    <DialogDescription>
                        `{clinic?.name}` adlı kliniğin adını güncelleyin.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Yeni Klinik Adı</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
                            <Button type="submit" disabled={updateClinicMutation.isPending}>
                                {updateClinicMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Değişiklikleri Kaydet
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}