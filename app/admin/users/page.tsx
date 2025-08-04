'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDeleteUser, useUsers, useReactivateUser } from '@/hooks/useUserService';
import { useDebounce } from '@/hooks/useDebounce';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

import {
    MoreHorizontal, PlusCircle, Search, Trash2, Pencil, ShieldCheck,
    Stethoscope, HeartPulse, User, UserCheck, ServerCrash, UserX
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
    ROLE_PATIENT: { label: "Hasta", icon: HeartPulse, className: "text-green-600 dark:text-green-400" },
    DEFAULT: { label: "Bilinmeyen", icon: User, className: "text-muted-foreground" }
};

const StatusBadge = ({ isDeleted }: { isDeleted: boolean }) => (
    <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${isDeleted ? 'bg-gray-400' : 'bg-green-500'}`}></span>
        <span className="text-sm font-medium text-muted-foreground">{isDeleted ? "Pasif" : "Aktif"}</span>
    </div>
);

const TableRowSkeleton = () => (
    <TableRow>
        <TableCell className="py-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[200px]" />
                </div>
            </div>
        </TableCell>
        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-[80px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
        <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-[100px]" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
    </TableRow>
);


export default function UsersPage() {
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("ALL");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [actionToConfirm, setActionToConfirm] = useState<{ type: 'delete' | 'reactivate'; user: { id: number; name: string; };} | null>(null);
    const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
    const [editingPatientProfile, setEditingPatientProfile] = useState<UserResponse | null>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const { data, error, isLoading } = useUsers(page, PAGE_SIZE, debouncedSearchTerm, selectedRole, selectedStatus);
    const deleteUserMutation = useDeleteUser();
    const reactivateUserMutation = useReactivateUser();

    useEffect(() => { setPage(0); }, [debouncedSearchTerm, selectedRole, selectedStatus]);

    if (error) {
        return (
            <div className="flex flex-col h-[80vh] items-center justify-center text-center p-8">
                <ServerCrash className="h-16 w-16 text-red-500 mb-4"/>
                <h2 className="text-2xl font-semibold text-red-600">Bir Hata Oluştu</h2>
                <p className="mt-2 text-muted-foreground">Kullanıcı verileri yüklenemedi.</p>
            </div>
        );
    }

    const users = data?.content ?? [];
    const totalElements = data?.totalElements ?? 0;
    const totalPages = data?.totalPages ?? 0;

    return (
        <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 sm:p-6 md:p-8 min-h-screen">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Kullanıcı Yönetimi</h1>
                    <p className="mt-1 text-md text-gray-500 dark:text-gray-400">Sistemdeki tüm kullanıcıları görüntüleyin, arayın ve yönetin.</p>
                </header>

                <Card className="shadow-subtle border-gray-200/80 dark:border-gray-800/50">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row items-center gap-3 p-2 mb-4 border-b dark:border-gray-800">
                            <div className="relative w-full md:max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="İsim, soyisim veya e-posta ile ara..." className="pl-10 bg-transparent" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto md:ml-4">
                                <Select value={selectedRole} onValueChange={setSelectedRole}><SelectTrigger className="w-full md:w-[160px]"><SelectValue placeholder="Role Göre Filtrele" /></SelectTrigger><SelectContent><SelectItem value="ALL">Tüm Roller</SelectItem><SelectItem value="ROLE_ADMIN">Admin</SelectItem><SelectItem value="ROLE_DOCTOR">Doktor</SelectItem><SelectItem value="ROLE_PATIENT">Hasta</SelectItem></SelectContent></Select>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}><SelectTrigger className="w-full md:w-[160px]"><SelectValue placeholder="Duruma Göre Filtrele" /></SelectTrigger><SelectContent><SelectItem value="ALL">Tüm Durumlar</SelectItem><SelectItem value="ACTIVE">Aktif</SelectItem><SelectItem value="PASSIVE">Pasif</SelectItem></SelectContent></Select>
                            </div>
                            <Link href="/admin/users/create" className="w-full md:w-auto md:ml-auto mt-2 md:mt-0">
                                <Button className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Yeni Kullanıcı</Button>
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b-gray-200/80 dark:border-b-gray-800/50">
                                        <TableHead className="font-semibold text-base text-gray-600 dark:text-gray-300">Kullanıcı</TableHead>
                                        <TableHead className="hidden md:table-cell font-semibold text-base text-gray-600 dark:text-gray-300">Profil</TableHead>
                                        <TableHead className="font-semibold text-base text-gray-600 dark:text-gray-300">Durum</TableHead>
                                        <TableHead className="hidden lg:table-cell font-semibold text-base text-gray-600 dark:text-gray-300">Kayıt Tarihi</TableHead>
                                        <TableHead className="text-right font-semibold text-base text-gray-600 dark:text-gray-300">İşlemler</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {isLoading ? (
                                            Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                                        ) : users.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center h-48">
                                                    <UserX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                                    <h3 className="text-lg font-semibold">Sonuç Bulunamadı</h3>
                                                    <p className="text-muted-foreground">Filtre kriterlerinizi değiştirmeyi deneyin.</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            users.map((user) => {
                                                const { label, icon: Icon, className } = roleConfig[user.role] || roleConfig.DEFAULT;
                                                return (
                                                    <motion.tr key={user.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors">
                                                        <TableCell className="py-3">
                                                            <div className="flex items-center gap-4">
                                                                <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-primary"><AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback></Avatar>
                                                                <div>
                                                                    <div className="font-semibold text-foreground">{user.firstName} {user.lastName}</div>
                                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            <div className={`flex items-center gap-2 text-sm font-medium ${className}`}><Icon className="h-4 w-4"/><span>{label}</span></div>
                                                        </TableCell>
                                                        <TableCell><StatusBadge isDeleted={user.deleted} /></TableCell>
                                                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5"/></Button></DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onSelect={() => setSelectedUserId(user.id)}><User className="mr-2 h-4 w-4"/> Detaylar</DropdownMenuItem>
                                                                    {user.role === 'ROLE_PATIENT' ? (
                                                                        <>
                                                                            <DropdownMenuItem onSelect={() => setEditingUser(user)}>
                                                                                <Pencil className="mr-2 h-4 w-4" /> Kullanıcı Bilgilerini Düzenle
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem onSelect={() => setEditingPatientProfile(user)}>
                                                                                <HeartPulse className="mr-2 h-4 w-4" /> Tıbbi Profili Düzenle
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    ) : (
                                                                        <DropdownMenuItem onSelect={() => setEditingUser(user)}>
                                                                            <Pencil className="mr-2 h-4 w-4" /> Kullanıcıyı Düzenle
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuSeparator />
                                                                    {user.deleted ? (
                                                                        <DropdownMenuItem className="text-green-600 focus:text-green-600" onSelect={(e) => { e.preventDefault(); setActionToConfirm({ type: 'reactivate', user: { id: user.id, name: `${user.firstName} ${user.lastName}` } });}}><UserCheck className="mr-2 h-4 w-4"/> Aktif Et</DropdownMenuItem>
                                                                    ) : (
                                                                        <DropdownMenuItem className="text-red-500 focus:text-red-500" onSelect={(e) => { e.preventDefault(); setActionToConfirm({ type: 'delete', user: { id: user.id, name: `${user.firstName} ${user.lastName}` } });}}><Trash2 className="mr-2 h-4 w-4"/> Pasif Et</DropdownMenuItem>
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
                            <div className="text-sm text-muted-foreground">Toplam <span className="font-bold">{totalElements}</span> kullanıcı</div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 0}>Önceki</Button>
                                <span className="text-sm font-medium">{totalPages > 0 ? page + 1 : 0} / {totalPages}</span>
                                <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page + 1 >= totalPages}>Sonraki</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <UserDetailDialog userId={selectedUserId} onOpenChange={(open) => !open && setSelectedUserId(null)} />
            <ConfirmationDialog isOpen={!!actionToConfirm} onClose={() => setActionToConfirm(null)} onConfirm={() => {
                if (actionToConfirm?.type === 'delete') { deleteUserMutation.mutate(actionToConfirm.user.id); }
                else if (actionToConfirm?.type === 'reactivate') { reactivateUserMutation.mutate(actionToConfirm.user.id); }
            }}
                                title={actionToConfirm?.type === 'delete' ? `'${actionToConfirm?.user.name}' Pasif Edilecek` : `'${actionToConfirm?.user.name}' Aktif Edilecek`}
                                description={actionToConfirm?.type === 'delete' ? "Bu kullanıcı artık sisteme giriş yapamayacak. Emin misiniz?" : "Bu kullanıcı tekrar sisteme giriş yapabilecek. Emin misiniz?"}
            />
            <UserEditDialog userId={editingUser?.id || null} onOpenChange={(open) => !open && setEditingUser(null)} />
            <PatientEditDialog userId={editingPatientProfile?.id || null} onOpenChange={(open) => !open && setEditingPatientProfile(null)} />
        </>
    );
}