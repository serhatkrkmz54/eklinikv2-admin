import { Loader } from "@/components/mycomp/layout/loader";

export default function AdminLoading() {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Loader size="lg" text="Admin Paneli Yükleniyor..." />
        </div>
    );
}