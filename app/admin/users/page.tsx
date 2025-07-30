'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUsers } from '@/hooks/useUserService';
import { useDebounce } from '@/hooks/useDebounce';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Select'i import ediyoruz
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/mycomp/layout/loader";
import {
    MoreHorizontal,
    PlusCircle,
    Search,
    Trash2,
    Pencil,
    Filter,
    ShieldCheck,
    Stethoscope,
    HeartPulse, Icon, User
} from 'lucide-react';
import {UserDetailDialog} from "@/components/mycomp/dashboard/users/UserDetailDialog";

const PAGE_SIZE = 15;

const roleConfig: { [key: string]: { label: string; icon: React.ElementType; className: string; } } = {
    ROLE_ADMIN: { label: "Admin", icon: ShieldCheck, className: "text-red-600 dark:text-red-400" },
    ROLE_DOCTOR: { label: "Doktor", icon: Stethoscope, className: "text-sky-600 dark:text-sky-400" },
    ROLE_PATIENT: { label: "Hasta", icon: HeartPulse, className: "text-green-600 dark:text-green-400" }
};

export default function UsersPage() {
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("ALL");
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const { data, error, isLoading } = useUsers(page, PAGE_SIZE, debouncedSearchTerm, selectedRole);

    useEffect(() => {
        setPage(0);
    }, [debouncedSearchTerm, selectedRole]);


    if (isLoading) {
        return <div className="flex h-[80vh] items-center justify-center"><Loader size="lg" text="Kullanıcılar Yükleniyor..." /></div>;
    }
    if (error) {
        return <div className="p-8 text-red-500">Hata: {error.message}</div>;
    }

    return (
        <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 sm:p-6 bg-gray-50/50 dark:bg-background min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Kullanıcı Yönetimi</h1>
                <p className="mt-1 text-md text-gray-500 dark:text-gray-400">Sistemdeki tüm kullanıcıları görüntüleyin, arayın ve yönetin.</p>
            </header>

            <Card className="shadow-sm border-gray-200/80 dark:border-gray-800/50">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                        <div className="relative w-full md:max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="İsim, soyisim veya e-posta ile ara..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select
                                value={selectedRole}
                                onValueChange={(value) => {
                                    setSelectedRole(value);
                                    setPage(0);
                                }}
                            >
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Role Göre Filtrele" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tüm Roller</SelectItem>
                                    <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
                                    <SelectItem value="ROLE_DOCTOR">Doktor</SelectItem>
                                    <SelectItem value="ROLE_PATIENT">Hasta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Link href="/admin/users/create" className="w-full md:w-auto md:ml-auto">
                            <Button className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Yeni Kullanıcı</Button>
                        </Link>
                    </div>

                    <div className="rounded-lg border dark:border-gray-800">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ad Soyad</TableHead>
                                    <TableHead className="hidden lg:table-cell">T.C. Kimlik No</TableHead>
                                    <TableHead className="hidden md:table-cell">E-posta</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead className="hidden xl:table-cell">Kayıt Tarihi</TableHead>
                                    <TableHead><span className="sr-only">İşlemler</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence>
                                    {data?.content.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center h-24">Arama kriterlerine uygun kullanıcı bulunamadı.</TableCell></TableRow>
                                    ) : (
                                        data?.content.map((user) => {
                                            const currentRole = roleConfig[user.role] || {
                                                label: user.role,
                                                icon: User,
                                                className: "text-muted-foreground"
                                            };
                                            const Icon = currentRole.icon;

                                            return (
                                                <motion.tr key={user.id} layout initial={{opacity: 0}}
                                                           animate={{opacity: 1}} exit={{opacity: 0}}
                                                           onClick={() => setSelectedUserId(user.id)}
                                                           className="hover:bg-muted/50">
                                                    <TableCell
                                                        className="font-medium">{user.firstName} {user.lastName}</TableCell>
                                                    <TableCell
                                                        className="hidden lg:table-cell text-muted-foreground">{user.nationalId}</TableCell>
                                                    <TableCell
                                                        className="hidden md:table-cell text-muted-foreground">{user.email}</TableCell>

                                                    {/* DEĞİŞİKLİK BURADA */}
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Icon className={`h-4 w-4 ${currentRole.className}`}/>
                                                            <span
                                                                className="font-medium text-foreground">{currentRole.label}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell
                                                        className="hidden xl:table-cell text-muted-foreground">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreHorizontal className="h-4 w-4"/>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem><Pencil
                                                                    className="mr-2 h-4 w-4"/> Düzenle</DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50">
                                                                    <Trash2 className="mr-2 h-4 w-4"/> Sil
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </motion.tr>
                                            );
                                        })
                                    )}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between mt-4 px-2">
                        <div className="text-sm text-muted-foreground">Toplam <span className="font-bold">{data?.totalElements}</span> kullanıcı</div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 0}>Önceki</Button>
                            <span className="text-sm font-medium">{data && data.totalPages > 0 ? page + 1 : 0} / {data?.totalPages}</span>
                            <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page + 1 >= (data?.totalPages ?? 0)}>Sonraki</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
            <UserDetailDialog
                userId={selectedUserId}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedUserId(null);
                    }
                }}
            />
        </>
    );
}