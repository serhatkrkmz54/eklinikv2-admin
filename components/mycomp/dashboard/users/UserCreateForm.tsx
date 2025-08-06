"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import {
    Fingerprint,
    KeyRound,
    Loader2,
    Mail,
    Phone,
    User,
    UserPlus,
    ShieldCheck,
    Stethoscope,
    HeartPulse,
    Eye,
    EyeOff,
    Users, CheckCircle2,
} from "lucide-react";
import { createUser } from "@/hooks/useUserService";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
    nationalId: z.string().regex(/^\d{11}$/, { message: "T.C. Kimlik numarası 11 haneli olmalıdır." }),
    email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }),
    password: z.string().min(8, { message: "Şifre en az 8 karakter olmalıdır." }),
    firstName: z.string().min(2, { message: "İsim en az 2 karakter olmalıdır." }),
    lastName: z.string().min(2, { message: "Soyisim en az 2 karakter olmalıdır." }),
    phoneNumber: z.string().regex(/^\+90 \d{3} \d{3} \d{2} \d{2}$/, { message: "Telefon '+90 5XX XXX XX XX' formatında olmalıdır." }),
    role: z.enum(["ROLE_PATIENT", "ROLE_DOCTOR", "ROLE_ADMIN"], { message: "Lütfen geçerli bir rol seçin." }),
});

export type CreateUserFormValues = z.infer<typeof formSchema>;

interface UserResponse {
    id: number;
    nationalId: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: "ROLE_PATIENT" | "ROLE_DOCTOR" | "ROLE_ADMIN";
    createdAt: string;
}

const formatPhone = (val: string) => {
    let digits = val.replace(/\D/g, "");
    if (digits.startsWith("90")) { digits = digits.slice(2); }
    digits = digits.slice(0, 10);
    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 6);
    const part3 = digits.slice(6, 8);
    const part4 = digits.slice(8, 10);
    return `+90 ${part1}${part2 ? " " + part2 : ""}${part3 ? " " + part3 : ""}${part4 ? " " + part4 : ""}`.trim();
};

const userRoles = [
    { value: "ROLE_PATIENT", label: "Hasta", icon: <HeartPulse className="h-4 w-4" /> },
    { value: "ROLE_DOCTOR", label: "Doktor", icon: <Stethoscope className="h-4 w-4" /> },
    { value: "ROLE_ADMIN", label: "Admin", icon: <ShieldCheck className="h-4 w-4" /> },
];

const FormInput = React.forwardRef<HTMLInputElement, any & { showSuccess?: boolean; error?: any }>(({ icon, showSuccess, error, ...props }, ref) => (
    <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>
        <Input ref={ref} {...props} className={`pl-10 pr-10 ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`} />
        {showSuccess && (<div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"><CheckCircle2 className="h-5 w-5" /></div>)}
    </div>
));
FormInput.displayName = "FormInput";

export function UserCreateForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newlyAddedUsers, setNewlyAddedUsers] = useState<UserResponse[]>([]);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nationalId: "", email: "", password: "", firstName: "", lastName: "", phoneNumber: "+90 ", role: undefined,
        },
        mode: "onTouched",
    });

    const { setError } = form;

    async function onSubmit(values: CreateUserFormValues) {
        setIsSubmitting(true);
        try {
            const payload = { ...values, phoneNumber: values.phoneNumber.replace(/\s/g, '') };

            const newUser = await createUser(payload);

            toast.success("Kullanıcı Başarıyla Oluşturuldu!", {
                description: `${newUser.firstName} ${newUser.lastName} adlı kullanıcı sisteme eklendi.`,
            });
            setNewlyAddedUsers(prevUsers => [newUser, ...prevUsers]);
            form.reset();
            form.setValue("phoneNumber", "+90 ");
        } catch (error: any) {
            const errorMessage = error.message || "Bilinmeyen bir hata oluştu.";
            if (errorMessage.includes("TC Kimlik")) {
                setError("nationalId", { type: "server", message: errorMessage });
            } else if (errorMessage.includes("e-posta")) {
                setError("email", { type: "server", message: errorMessage });
            } else {
                toast.error("Kayıt Başarısız!", { description: errorMessage });
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen w-full bg-muted/40 ">
            <div className="grid lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="lg:col-span-2"
                >
                    <Card className="shadow-lg border-none rounded-xl overflow-hidden">
                        <CardHeader className="bg-card p-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-lg"><UserPlus className="h-6 w-6 text-primary" /></div>
                                <div>
                                    <CardTitle className="text-2xl font-bold tracking-tight">Yeni Kullanıcı Oluştur</CardTitle>
                                    <CardDescription className="text-md">Sisteme yeni bir kullanıcı profili ekleyin.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <CardContent className="p-6 space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-foreground">Kişisel Bilgiler</h3>
                                        <Separator />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="firstName" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>İsim</FormLabel>
                                                    <FormControl><FormInput icon={<User className="h-4 w-4"/>} placeholder="örn: Ahmet" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                            <FormField control={form.control} name="lastName" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Soyisim</FormLabel>
                                                    <FormControl><FormInput icon={<User className="h-4 w-4"/>} placeholder="örn: Yılmaz" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="nationalId"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormLabel>T.C. Kimlik Numarası</FormLabel>
                                                    <FormControl>
                                                        <FormInput
                                                            icon={<Fingerprint className="h-4 w-4" />}
                                                            placeholder="11 Haneli Kimlik No"
                                                            {...field}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 11))}
                                                            error={fieldState.error}
                                                            showSuccess={field.value.length === 11 && !fieldState.error}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField control={form.control} name="phoneNumber" render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel>Telefon Numarası</FormLabel>
                                                <FormControl>
                                                    <FormInput
                                                        icon={<Phone className="h-4 w-4"/>}
                                                        placeholder="+90 5XX XXX XX XX"
                                                        {...field}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(formatPhone(e.target.value))}
                                                        error={fieldState.error}
                                                        showSuccess={field.value.length > 5 && !fieldState.error}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-foreground">Hesap Bilgileri</h3>
                                        <Separator />
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>E-posta Adresi</FormLabel>
                                                <FormControl><FormInput icon={<Mail className="h-4 w-4"/>} type="email" placeholder="kullanici@ornek.com" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="password" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Şifre</FormLabel>
                                                    <FormControl><div className="relative"><FormInput icon={<KeyRound className="h-4 w-4"/>} type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</Button></div></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                            <FormField control={form.control} name="role" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kullanıcı Rolü</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Bir rol seçin..." /></SelectTrigger></FormControl><SelectContent>{userRoles.map((role) => (<SelectItem key={role.value} value={role.value}><div className="flex items-center gap-2">{role.icon} {role.label}</div></SelectItem>))}</SelectContent></Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-6 bg-muted/40">
                                    <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
                                        {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
                                        {isSubmitting ? "Kullanıcı Oluşturuluyor..." : "Kullanıcıyı Oluştur"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut", delay: 0.2 }}
                    className="lg:col-span-1"
                >
                    <div className="sticky top-8">
                        <Card className="shadow-lg border-none rounded-xl">
                            <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-xl">Son Eklenenler</CardTitle><Users className="h-5 w-5 text-muted-foreground" /></CardHeader>
                            <CardContent>
                                <AnimatePresence>
                                    {newlyAddedUsers.length > 0 ? (
                                        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="visible" className="space-y-4">
                                            {newlyAddedUsers.map((user) => (
                                                <motion.div key={user.id} layout variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }} className="flex items-center justify-between p-3 border rounded-lg bg-card transition-shadow hover:shadow-md">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2 bg-muted rounded-full"><User className="h-5 w-5 text-muted-foreground" /></div>
                                                        <div>
                                                            <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
                                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-full capitalize">{user.role?.replace('ROLE_', '').toLowerCase()}</div>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    ) : (
                                        <div className="text-center py-12 px-6 border-2 border-dashed rounded-lg">
                                            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                                            <h3 className="mt-4 text-lg font-medium">Henüz Kullanıcı Eklenmedi</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">Formu doldurarak yeni bir kullanıcı ekleyin.</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
