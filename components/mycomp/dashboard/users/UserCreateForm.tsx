"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Control } from "react-hook-form";
import { z } from "zod";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {AnimatePresence, motion} from "framer-motion";
import {
    CheckCircle2,
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
    AlertCircle,
} from "lucide-react";
import { createUser } from "@/hooks/useUserService";

const formSchema = z.object({
    nationalId: z
        .string()
        .regex(/^\d{11}$/, { message: "T.C. Kimlik numarası 11 haneli ve sadece rakam olmalı." }),
    email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }),
    password: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır." }),
    firstName: z.string().min(1, { message: "İsim boş olamaz." }),
    lastName: z.string().min(1, { message: "Soyisim boş olamaz." }),
    phoneNumber: z
        .string()
        .regex(/^\+90 \d{3} \d{3} \d{2} \d{2}$/, { message: "Telefon numarası '+90 5XX XXX XX XX' formatında olmalıdır." }),
    role: z.enum(["ROLE_PATIENT", "ROLE_DOCTOR", "ROLE_ADMIN"], {
        message: "Lütfen geçerli bir rol seçin."
    }),
});

export type CreateUserFormValues = z.infer<typeof formSchema>;

interface UserResponse {
    id: number; // Long -> number
    nationalId: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: "ROLE_PATIENT" | "ROLE_DOCTOR" | "ROLE_ADMIN";
    createdAt: string; // LocalDateTime -> string
}

const formatPhone = (val: string) => {
    let digits = val.replace(/\D/g, "");
    if (!digits.startsWith("90")) digits = "90" + digits;
    digits = digits.slice(0, 12);
    const part1 = digits.slice(2, 5);
    const part2 = digits.slice(5, 8);
    const part3 = digits.slice(8, 10);
    const part4 = digits.slice(10, 12);
    return `+90${part1 ? " " + part1 : ""}${part2 ? " " + part2 : ""}${part3 ? " " + part3 : ""}${part4 ? " " + part4 : ""}`;
};

const userRoles = [
    { value: "ROLE_PATIENT", label: "Hasta", icon: <HeartPulse className="h-4 w-4 mr-2" /> },
    { value: "ROLE_DOCTOR", label: "Doktor", icon: <Stethoscope className="h-4 w-4 mr-2" /> },
    { value: "ROLE_ADMIN", label: "Admin", icon: <ShieldCheck className="h-4 w-4 mr-2" /> },
];

type InputWithIconProps = {
    control: Control<CreateUserFormValues>;
    name: keyof CreateUserFormValues;
    placeholder: string;
    icon: React.ReactNode;
    type?: string;
    validateFn?: (val: string) => boolean;
};

// --- Ortak Input ---
const InputWithTooltipIcon = ({ control, name, placeholder, icon, type = "text", validateFn }: InputWithIconProps) => (
    <FormField
        control={control}
        name={name}
        render={({ field, fieldState }) => {
            const valid = validateFn ? validateFn(field.value) : false;
            return (
                <FormItem>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>
                        <FormControl>
                            <Input
                                type={type}
                                placeholder={placeholder}
                                value={field.value}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    if (name === "nationalId") {
                                        val = val.replace(/\D/g, "").slice(0, 11);
                                    }
                                    if (name === "phoneNumber") {
                                        val = formatPhone(val);
                                    }
                                    field.onChange(val);
                                }}
                                className={`pl-10 pr-10 ${
                                    fieldState.error ? "border-red-500 focus-visible:ring-red-500" : ""
                                }`}
                            />
                        </FormControl>

                        {valid && !fieldState.error && (
                            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}

                        {fieldState.error && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                                            <AlertCircle className="h-5 w-5 text-red-500" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-red-600 text-white text-xs rounded-md">
                                        {fieldState.error.message}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </FormItem>
            );
        }}
    />
);

export function UserCreateForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newlyAddedUsers, setNewlyAddedUsers] = useState<any[]>([]);

    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nationalId: "",
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            phoneNumber: "+90",
            role: undefined,
        },
        mode: "onTouched",
    });

    const { setError } = form;

    async function onSubmit(values: CreateUserFormValues) {
        setIsSubmitting(true);
        try {
            const payload = {
                ...values,
                phoneNumber: values.phoneNumber.replace(/\s/g, '')
            };
            const newUser: UserResponse = await createUser(payload);
            toast.success("Kullanıcı Oluşturuldu!", {
                description: `${newUser.firstName} ${newUser.lastName} başarıyla eklendi.`,
            });
            setNewlyAddedUsers(prevUsers => [newUser, ...prevUsers]);
            form.reset();
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
        <div className="w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="shadow-md border rounded-xl">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <UserPlus className="h-6 w-6 text-primary" />
                        </div>
                        Yeni Kullanıcı Oluştur
                    </CardTitle>
                    <CardDescription>Sisteme yeni bir kullanıcı kaydı ekleyin</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputWithTooltipIcon
                                    control={form.control}
                                    name="firstName"
                                    placeholder="İsim"
                                    icon={<User className="h-4 w-4" />}
                                />
                                <InputWithTooltipIcon
                                    control={form.control}
                                    name="lastName"
                                    placeholder="Soyisim"
                                    icon={<User className="h-4 w-4" />}
                                />
                                <InputWithTooltipIcon
                                    control={form.control}
                                    name="nationalId"
                                    placeholder="T.C. Kimlik No"
                                    icon={<Fingerprint className="h-4 w-4" />}
                                    validateFn={(val) => /^\d{11}$/.test(val)}
                                />
                                <InputWithTooltipIcon
                                    control={form.control}
                                    name="phoneNumber"
                                    placeholder="+90 5XX XXX XX XX"
                                    icon={<Phone className="h-4 w-4" />}
                                    validateFn={(val) => /^\+90 \d{3} \d{3} \d{2} \d{2}$/.test(val)}
                                />
                                <div className="md:col-span-2">
                                    <InputWithTooltipIcon
                                        control={form.control}
                                        name="email"
                                        placeholder="E-posta Adresi"
                                        icon={<Mail className="h-4 w-4" />}
                                        type="email"
                                    />
                                </div>
                                <InputWithTooltipIcon
                                    control={form.control}
                                    name="password"
                                    placeholder="Şifre"
                                    icon={<KeyRound className="h-4 w-4" />}
                                    type="password"
                                />
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field, fieldState }) => (
                                        <div className="relative">
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className={fieldState.error ? "border-red-500 focus:ring-red-500" : ""}>
                                                        <SelectValue placeholder="Rol seçin..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {userRoles.map((role) => (
                                                        <SelectItem key={role.value} value={role.value}>
                                                            <div className="flex items-center">
                                                                {role.icon} {role.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                                                                <AlertCircle className="h-5 w-5 text-red-500" />
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-red-600 text-white text-xs rounded-md">
                                                            {fieldState.error.message}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={isSubmitting} size="lg" className="w-full md:w-auto">
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                    {isSubmitting ? "Oluşturuluyor..." : "Kullanıcıyı Oluştur"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </motion.div>
            <AnimatePresence>
                {newlyAddedUsers.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-10"
                    >
                        <h2 className="text-xl font-semibold mb-4 text-foreground">Son Eklenenler</h2>
                        <div className="space-y-3">
                            {newlyAddedUsers.map((user) => (
                                <motion.div
                                    key={user.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-center justify-between p-4 border rounded-lg bg-card"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-muted rounded-full">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full capitalize">
                                        {user.role?.replace('ROLE_', '').toLowerCase()}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

    );
}
