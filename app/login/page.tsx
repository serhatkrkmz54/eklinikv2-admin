"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

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
import { ShieldCheck, Stethoscope } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
    nationalId: z.string().length(11, { message: "T.C. Kimlik Numarası 11 haneli olmalıdır." }),
    password: z.string().min(1, { message: "Şifre alanı boş bırakılamaz." }),
});

export default function LoginPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginType, setLoginType] = useState<'admin' | 'doctor'>('admin');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { nationalId: "", password: "" },
    });

    const handleLoginTypeChange = (type: 'admin' | 'doctor') => {
        setLoginType(type);
        form.reset();
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {

            const result = await signIn("credentials", {
                nationalId: values.nationalId,
                password: values.password,
                loginType: loginType,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Giriş Başarısız", {
                    description: "T.C. Kimlik Numarası, şifre veya rol hatalı.",
                });
            } else if (result?.ok) {
                toast.success("Giriş başarılı! Yönlendiriliyorsunuz...");
                router.push("/");
            }
        } catch (err) {
            console.error("Beklenmedik bir hata oluştu:", err);
            toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 via-blue-100 to-cyan-100 dark:from-gray-900 dark:via-blue-900 dark:to-cyan-900 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Stethoscope className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        Klinik Yönetim Sistemi
                    </h1>
                </div>

                <Card className="shadow-2xl rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
                    <CardHeader>
                        <div className="grid grid-cols-2 gap-2 mb-6">
                            <Button
                                variant={loginType === 'admin' ? 'default' : 'outline'}
                                onClick={() => handleLoginTypeChange('admin')}
                                className="rounded-lg transition-all"
                            >
                                <ShieldCheck className="mr-2 h-4 w-4" /> Admin Girişi
                            </Button>
                            <Button
                                variant={loginType === 'doctor' ? 'default' : 'outline'}
                                onClick={() => handleLoginTypeChange('doctor')}
                                className="rounded-lg transition-all"
                            >
                                <Stethoscope className="mr-2 h-4 w-4" /> Doktor Girişi
                            </Button>
                        </div>
                        <CardTitle className="text-2xl text-center font-semibold text-gray-800 dark:text-gray-200">
                            {loginType === 'admin' ? "Admin Paneli Giriş" : "Doktor Paneli Giriş"}
                        </CardTitle>
                        <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                            Lütfen hesabınızla giriş yapınız.
                        </CardDescription>
                    </CardHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardContent className="p-6 grid gap-5">
                                <FormField
                                    control={form.control}
                                    name="nationalId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>T.C. Kimlik Numarası</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="TC Kimlik Numarası"
                                                    {...field}
                                                    className="bg-white/50 dark:bg-gray-700/50"
                                                />
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
                                                <Input
                                                    placeholder="******"
                                                    type="password"
                                                    {...field}
                                                    className="bg-white/50 dark:bg-gray-700/50"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter className="p-6 pt-2">
                                <Button
                                    className="w-full text-sm py-6 rounded-lg font-bold transition-all hover:scale-102 active:scale-100"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Giriş Yapılıyor..." : "Giriş Yap"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
                <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                    © {new Date().getFullYear()} Klinik Yönetim Sistemi. Tüm hakları saklıdır.
                </p>
            </div>
        </main>
    );
}
