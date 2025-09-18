"use client";

import { useDoctorById, useUserById } from "@/hooks/useUserService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "@/components/mycomp/layout/loader";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Briefcase,
  Calendar,
  Fingerprint,
  HeartPulse,
  Mail,
  Phone,
  Pill,
  Scale,
  ShieldCheck,
  Stethoscope,
  User,
} from "lucide-react";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const roleConfig: {
  [key: string]: { label: string; icon: React.ElementType; className: string };
} = {
  ROLE_ADMIN: {
    label: "Admin",
    icon: ShieldCheck,
    className: "text-red-600 dark:text-red-400",
  },
  ROLE_DOCTOR: {
    label: "Doktor",
    icon: Stethoscope,
    className: "text-sky-600 dark:text-sky-400",
  },
  ROLE_PATIENT: {
    label: "Hasta",
    icon: HeartPulse,
    className: "text-green-600 dark:text-green-400",
  },
};

interface UserDetailDialogProps {
  userId: number | null;
  onOpenChange: (open: boolean) => void;
}

const detailValueVariants = cva("font-semibold text-foreground break-all", {
  variants: {
    variant: {
      default: "text-foreground",
      destructive: "text-destructive font-bold",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const DetailItem = ({
  icon: Icon,
  label,
  value,
  unit = "",
  variant,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number | null | boolean;
  unit?: string;
  variant?: "default" | "destructive";
}) => {
  let displayValue: React.ReactNode = (
    <span className="text-sm text-muted-foreground italic">Belirtilmemiş</span>
  );

  if (typeof value === "boolean") {
    displayValue = value ? "Var" : "Yok";
  } else if (value !== null && value !== undefined && value !== "") {
    displayValue = `${value}${unit}`;
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="text-muted-foreground min-w-[120px]">{label}:</span>
      <span className={cn(detailValueVariants({ variant }))}>
        {displayValue}
      </span>
    </div>
  );
};

export function UserDetailDialog({
  userId,
  onOpenChange,
}: UserDetailDialogProps) {
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useUserById(userId);

  const {
    data: doctorProfile,
    isLoading: isDoctorLoading,
    error: doctorError,
  } = useDoctorById(userId, user?.role || null);

  const isLoading =
    isUserLoading || (user?.role === "ROLE_DOCTOR" && isDoctorLoading);
  const error = userError || doctorError;

  const getRoleDetails = (role: string) =>
    roleConfig[role] || {
      label: role,
      icon: User,
      className: "text-muted-foreground",
    };

  return (
    <Dialog open={!!userId} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0">
        <VisuallyHidden asChild>
          <DialogHeader>
            <DialogTitle>
              {user
                ? `${user.firstName} ${user.lastName} Kullanıcı Detayları`
                : "Kullanıcı Detayı"}
            </DialogTitle>
            <DialogDescription>
              Kullanıcının detaylı bilgileri.
            </DialogDescription>
          </DialogHeader>
        </VisuallyHidden>

        {isLoading && (
          <div className="h-[500px] flex items-center justify-center">
            <Loader text="Kullanıcı Bilgileri Yükleniyor..." />
          </div>
        )}
        {error && (
          <div className="h-[500px] flex items-center justify-center text-red-500">
            Hata: {error.message}
          </div>
        )}

        {user && (
          <div className="flex flex-col md:flex-row">
            <aside className="w-full md:w-1/3 bg-muted/50 p-6 border-b md:border-r md:border-b-0 flex flex-col items-center text-center">
              {React.createElement(getRoleDetails(user.role).icon, {
                className: `h-20 w-20 mb-4 ${
                  getRoleDetails(user.role).className
                }`,
              })}
              {doctorProfile && (
                <p className="font-semibold text-primary">
                  {doctorProfile.title}
                </p>
              )}
              <h2 className="text-xl font-bold text-foreground">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-muted-foreground text-sm">
                {getRoleDetails(user.role).label}
              </p>
              <Badge
                variant="outline"
                className={cn(
                  "mt-4",
                  user.deleted
                    ? "text-destructive border-destructive/30 bg-destructive/10"
                    : "text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-700 dark:bg-green-900/20"
                )}
              >
                {user.deleted ? "Pasif" : "Aktif"}
              </Badge>
              <Separator className="my-6" />
              <div className="space-y-4 text-left w-full text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground break-all">
                    {user.email}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground">{user.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground">
                    {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              </div>
            </aside>

            <main className="w-full md:w-2/3 p-6 md:p-8 md:pt-14 space-y-6 max-h-[80vh] overflow-y-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Fingerprint className="h-5 w-5" />
                    Kimlik Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DetailItem
                    icon={User}
                    label="T.C. Kimlik No"
                    value={user.nationalId}
                  />
                  {user.patientProfile && (
                    <DetailItem
                      icon={Calendar}
                      label="Doğum Tarihi"
                      value={
                        user.patientProfile.dateOfBirth
                          ? new Date(
                              user.patientProfile.dateOfBirth
                            ).toLocaleDateString("tr-TR")
                          : null
                      }
                    />
                  )}
                </CardContent>
              </Card>

              {user.role === "ROLE_DOCTOR" && doctorProfile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Stethoscope className="h-5 w-5" />
                      Doktor Profili
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <DetailItem
                      icon={Briefcase}
                      label="Klinik"
                      value={doctorProfile.clinic.name}
                    />
                  </CardContent>
                </Card>
              )}

              {user.role === "ROLE_PATIENT" && user.patientProfile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <HeartPulse className="h-5 w-5" />
                      Tıbbi Profil
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <DetailItem
                      icon={Scale}
                      label="Kilo"
                      value={user.patientProfile.weight}
                      unit=" kg"
                    />
                    <DetailItem
                      icon={Activity}
                      label="Boy"
                      value={user.patientProfile.height}
                      unit=" cm"
                    />
                    <DetailItem
                      icon={Pill}
                      label="İlaç Bağımlılığı"
                      value={user.patientProfile.isMedicationDependent}
                      variant={
                        user.patientProfile.isMedicationDependent
                          ? "destructive"
                          : "default"
                      }
                    />
                    <DetailItem
                      icon={HeartPulse}
                      label="Kronik Hastalık"
                      value={user.patientProfile.hasChronicIllness}
                      variant={
                        user.patientProfile.hasChronicIllness
                          ? "destructive"
                          : "default"
                      }
                    />
                  </CardContent>
                </Card>
              )}
            </main>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
