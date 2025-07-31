import { SettingsLayout } from "@/components/mycomp/dashboard/settings/SettingsLayout";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <SettingsLayout>
            {children}
        </SettingsLayout>
    );
}