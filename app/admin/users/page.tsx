'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDeleteUser, useUsers, useReactivateUser } from '@/hooks/useUserService';
import { useDebounce } from '@/hooks/useDebounce';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
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
    HeartPulse,
    User,
    UserCheck
} from 'lucide-react';
import { UserDetailDialog } from "@/components/mycomp/dashboard/users/UserDetailDialog";
import { ConfirmationDialog } from "@/components/mycomp/dashboard/users/ConfirmationDialog";
import { UserEditDialog } from "@/components/mycomp/dashboard/users/UserEditDialog";
import { PatientEditDialog } from "@/components/mycomp/dashboard/users/PatientEditDialog";
import { UserResponse } from '@/hooks/useUserProfile';

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
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [actionToConfirm, setActionToConfirm] = useState<{ type: 'delete' | 'reactivate'; user: { id: number; name: string; };} | null>(null);

    // --- State Management for Editing ---
    const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
    const [editingPatientProfile, setEditingPatientProfile] = useState<UserResponse | null>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const { data, error, isLoading } = useUsers(page, PAGE_SIZE, debouncedSearchTerm, selectedRole, selectedStatus);
    const deleteUserMutation = useDeleteUser();
    const reactivateUserMutation = useReactivateUser();

    useEffect(() => {
        setPage(0);
    }, [debouncedSearchTerm, selectedRole, selectedStatus]);


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
                            {/* Filter and Search Inputs */}
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
                                <Select value={selectedRole} onValueChange={(value) => { setSelectedRole(value); setPage(0); }}>
                                    <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Role Göre Filtrele" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tüm Roller</SelectItem>
                                        <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
                                        <SelectItem value="ROLE_DOCTOR">Doktor</SelectItem>
                                        <SelectItem value="ROLE_PATIENT">Hasta</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Duruma Göre Filtrele" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tüm Durumlar</SelectItem>
                                        <SelectItem value="ACTIVE">Aktif</SelectItem>
                                        <SelectItem value="PASSIVE">Pasif</SelectItem>
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
                                        <TableHead className="font-semibold">Ad Soyad</TableHead>
                                        <TableHead className="hidden lg:table-cell font-semibold">T.C. Kimlik No</TableHead>
                                        <TableHead className="font-semibold">Durum</TableHead>
                                        <TableHead className="hidden md:table-cell font-semibold">E-posta</TableHead>
                                        <TableHead className="font-semibold">Profil</TableHead>
                                        <TableHead className="hidden xl:table-cell font-semibold">Kayıt Tarihi</TableHead>
                                        <TableHead className="font-semibold text-right">İşlemler</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {data?.content.length === 0 ? (
                                            <TableRow><TableCell colSpan={7} className="text-center h-24">Arama kriterlerine uygun kullanıcı bulunamadı.</TableCell></TableRow>
                                        ) : (
                                            data?.content.map((user) => {
                                                const currentRole = roleConfig[user.role] || { label: user.role, icon: User, className: "text-muted-foreground" };
                                                const Icon = currentRole.icon;

                                                return (
                                                    <motion.tr key={user.id} layout initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="hover:bg-muted/50">
                                                        <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                                                        <TableCell className="hidden lg:table-cell text-muted-foreground">{user.nationalId}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={user.deleted ? "destructive" : "outline"} className={!user.deleted ? "text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-700 dark:bg-green-900/20" : ""}>
                                                                {user.deleted ? "Pasif" : "Aktif"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell text-muted-foreground">{user.email}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Icon className={`h-4 w-4 ${currentRole.className}`}/>
                                                                <span className="font-medium text-foreground">{currentRole.label}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden xl:table-cell text-muted-foreground">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onSelect={() => setSelectedUserId(user.id)}>
                                                                        <User className="mr-2 h-4 w-4"/> Detayları Görüntüle
                                                                    </DropdownMenuItem>

                                                                    {/* --- Dynamic Edit Menu --- */}
                                                                    {user.role === 'ROLE_PATIENT' ? (
                                                                        <>
                                                                            <DropdownMenuItem onSelect={() => setEditingUser(user)}>
                                                                                <Pencil className="mr-2 h-4 w-4"/> Kullanıcı Bilgilerini Düzenle
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem onSelect={() => setEditingPatientProfile(user)}>
                                                                                <HeartPulse className="mr-2 h-4 w-4"/> Hasta Profilini Düzenle
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    ) : (
                                                                        <DropdownMenuItem onSelect={() => setEditingUser(user)}>
                                                                            <Pencil className="mr-2 h-4 w-4"/> Kullanıcıyı Düzenle
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                    <DropdownMenuSeparator />

                                                                    {/* --- Dynamic Delete/Reactivate Menu --- */}
                                                                    {user.deleted ? (
                                                                        <DropdownMenuItem className="text-green-600 focus:text-green-600 focus:bg-green-50 dark:focus:bg-green-900/50" onSelect={(e) => { e.preventDefault(); setActionToConfirm({ type: 'reactivate', user: { id: user.id, name: `${user.firstName} ${user.lastName}` } });}}>
                                                                            <UserCheck className="mr-2 h-4 w-4"/> Aktif Et
                                                                        </DropdownMenuItem>
                                                                    ) : (
                                                                        <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50" onSelect={(e) => { e.preventDefault(); setActionToConfirm({ type: 'delete', user: { id: user.id, name: `${user.firstName} ${user.lastName}` } });}}>
                                                                            <Trash2 className="mr-2 h-4 w-4"/> Sil (Pasif Et)
                                                                        </DropdownMenuItem>
                                                                    )}
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
                onOpenChange={(open) => !open && setSelectedUserId(null)}
            />
            <ConfirmationDialog
                isOpen={!!actionToConfirm}
                onClose={() => setActionToConfirm(null)}
                onConfirm={() => {
                    if (actionToConfirm?.type === 'delete') {
                        deleteUserMutation.mutate(actionToConfirm.user.id);
                    } else if (actionToConfirm?.type === 'reactivate') {
                        reactivateUserMutation.mutate(actionToConfirm.user.id);
                    }
                }}
                title={actionToConfirm?.type === 'delete' ? `'${actionToConfirm?.user.name}' Adlı Kullanıcı Pasif Edilecek` : `'${actionToConfirm?.user.name}' Adlı Kullanıcı Aktif Edilecek`}
                description={actionToConfirm?.type === 'delete' ? "Bu kullanıcı artık sisteme giriş yapamayacak. Emin misiniz?" : "Bu kullanıcı tekrar sisteme giriş yapabilecek. Emin misiniz?"}
            />

            {/* --- Dialog Rendering Logic --- */}
            <UserEditDialog
                userId={editingUser?.id || null}
                onOpenChange={(open) => !open && setEditingUser(null)}
            />
            <PatientEditDialog
                userId={editingPatientProfile?.id || null}
                onOpenChange={(open) => !open && setEditingPatientProfile(null)}
            />
        </>
    );
}
