"use client";

import {useUserProfile} from "@/hooks/useUserProfile";
import {Loader} from "@/components/mycomp/layout/loader";

export function ProfileDisplay() {
    const { user, isLoading, error } = useUserProfile();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader size="md" text="Profil bilgileri yükleniyor..." />
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500">Profil bilgileri yüklenemedi.</div>;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Profil Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Adı Soyadı:</strong> {user?.firstName} {user?.lastName}</div>
                <div><strong>T.C. Kimlik No:</strong> {user?.nationalId}</div>
                <div><strong>Email:</strong> {user?.email}</div>
                <div><strong>Telefon:</strong> {user?.phoneNumber || "Belirtilmemiş"}</div>
                <div><strong>Rol:</strong> <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{user?.role}</span></div>
                <div><strong>Kayıt Tarihi:</strong> {user ? new Date(user.createdAt).toLocaleDateString('tr-TR') : ''}</div>
            </div>
        </div>
    );
}