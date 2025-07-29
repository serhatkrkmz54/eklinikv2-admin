'use client'

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Stethoscope } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { ModeToggle } from "./ModeToggle";
import React from "react";

interface NavbarProps {
    mobileMenuButton?: React.ReactNode;
}

export function Navbar({ mobileMenuButton }: NavbarProps) {
    const { status } = useSession();
    const { user, isLoading } = useUserProfile();

    const getInitials = () => {
        if (isLoading || !user) return '';
        const firstNameInitial = user.firstName?.charAt(0) || '';
        const lastNameInitial = user.lastName?.charAt(0) || '';
        return `${firstNameInitial}${lastNameInitial}`.toUpperCase();
    }

    return (
        <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-md py-2 px-5 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 h-16">

            <div className="flex items-center gap-4">
                {mobileMenuButton}
                <Link href="/admin" className="hidden sm:flex items-center gap-2 font-semibold text-lg">
                    <Stethoscope className="h-7 w-7 text-green-600" />
                    <span className="text-gray-800 dark:text-white">E-Klinik Admin</span>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <ModeToggle />

                {status === 'authenticated' && (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none rounded-full">
                            {isLoading ? (
                                <Skeleton className="h-10 w-10 rounded-full" />
                            ) : (
                                <Avatar>
                                    <AvatarFallback className="bg-green-100 text-green-700 font-bold">
                                        {getInitials()}
                                    </AvatarFallback>
                                </Avatar>
                            )}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>
                                {isLoading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-40" />
                                    </div>
                                ) : (
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                    </div>
                                )}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => signOut({ callbackUrl: '/login' })}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Çıkış Yap</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
}