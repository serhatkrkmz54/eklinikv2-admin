'use client';

import React, { useState } from 'react';
import { useUsers, useReactivateUser } from '@/hooks/useUserService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { UserCheck, Loader2 } from 'lucide-react'; // Loader2'yi import ediyoruz
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/mycomp/layout/loader';

const PAGE_SIZE = 5;

export function PassiveUsersTab() {
    const [page, setPage] = useState(0);

    const { data, isLoading, error } = useUsers(page, PAGE_SIZE, "", "ALL", "PASSIVE");

    // DEĞİŞİKLİK 1: isLoading -> isPending olarak değiştirildi
    const reactivateUserMutation = useReactivateUser();
    const { isPending } = reactivateUserMutation;

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader text="Pasif Kullanıcılar Yükleniyor..." /></div>;
    }

    if (error) {
        return <p className="text-red-500">Hata: {error.message}</p>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pasif (Silinmiş) Kullanıcılar</CardTitle>
                <CardDescription>
                    Bu kullanıcılar sisteme giriş yapamaz. Buradan kullanıcıları tekrar aktif hale getirebilirsiniz.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ad Soyad</TableHead>
                                <TableHead>E-posta</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead className="text-right">İşlem</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence>
                                {data?.content.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center h-24">Gösterilecek pasif kullanıcı bulunamadı.</TableCell></TableRow>
                                ) : (
                                    data?.content.map((user) => (
                                        <motion.tr key={user.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                            <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell className="capitalize">{user.role.replace('ROLE_', '').toLowerCase()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => reactivateUserMutation.mutate(user.id)}
                                                    // DEĞİŞİKLİK 2: disabled kontrolü isPending ile yapılıyor
                                                    disabled={isPending}
                                                >
                                                    {/* DEĞİŞİKLİK 3: Yüklenme durumunda buton içinde spinner gösteriliyor */}
                                                    {isPending ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                                    ) : (
                                                        <UserCheck className="mr-2 h-4 w-4 text-green-500"/>
                                                    )}
                                                    Aktif Et
                                                </Button>
                                            </TableCell>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}