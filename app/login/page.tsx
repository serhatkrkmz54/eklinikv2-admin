// app/login/page.tsx

"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Auth.js'in client tarafı hook'u
import { signIn } from "next-auth/react";


// Form validasyon şeması (backend'deki LoginRequest ile uyumlu)
const formSchema = z.object({
    nationalId: z
        .string()
        .min(11, { message: "T.C. Kimlik Numarası 11 haneli olmalıdır." })
        .max(11, { message: "T.C. Kimlik Numarası 11 haneli olmalıdır." }),
    password: z
        .string()
        .min(1, { message: "Şifre alanı boş bırakılamaz." }),
});

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nationalId: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setError(null);
        setIsSubmitting(true);
        try {
            // Auth.js'in signIn fonksiyonunu çağırıyoruz
            const result = await signIn("credentials", {
                nationalId: values.nationalId,
                password: values.password,
                redirect: false, // Sayfa yönlendirmesini biz yapacağız
            });

            if (result?.error) {
                // authorize fonksiyonu null dönerse burası çalışır.
                setError("T.C. Kimlik Numarası veya şifre hatalı.");
                console.error(result.error);
            } else if (result?.ok) {
                // Giriş başarılı, panele yönlendir.
                router.push("/admin");
            }
        } catch (err) {
            console.error("Beklenmedik bir hata oluştu:", err);
            setError("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Admin Paneli Giriş</CardTitle>
                    <CardDescription>
                        Lütfen yönetici hesabınızla giriş yapınız.
                    </CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="grid gap-4">
                            <FormField
                                control={form.control}
                                name="nationalId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>T.C. Kimlik Numarası</FormLabel>
                                        <FormControl>
                                            <Input placeholder="11111111111" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Şifre</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter className="flex flex-col">
                            {error && (
                                <div className="mb-4 text-sm font-medium text-red-600 bg-red-100 p-3 rounded-md w-full text-center">
                                    {error}
                                </div>
                            )}
                            <Button className="w-full" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Giriş Yapılıyor..." : "Giriş Yap"}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </main>
    );
}