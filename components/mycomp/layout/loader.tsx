// components/ui/loader.tsx

import { cva, type VariantProps } from "class-variance-authority";
import { HeartPulse } from "lucide-react";

import { cn } from "@/lib/utils";

// cva ile farklı boyut varyantları oluşturuyoruz
const loaderVariants = cva(
    // DEĞİŞİKLİK 1: "flex-col" kaldırıldı, "gap-4" -> "gap-3" olarak güncellendi
    "flex items-center justify-center gap-3",
    {
        variants: {
            size: {
                sm: "h-10",
                md: "h-16",
                lg: "h-24",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
);

const iconContainerVariants = cva("relative flex items-center justify-center", {
    variants: {
        size: {
            sm: "h-8 w-8",
            md: "h-12 w-12",
            lg: "h-16 w-16",
        }
    },
    defaultVariants: {
        size: "md"
    }
})

// Bileşenin alacağı propların tipini tanımlıyoruz
export interface LoaderProps extends VariantProps<typeof loaderVariants> {
    className?: string;
    text?: string;
}

export function Loader({ className, size, text }: LoaderProps) {
    return (
        <div className={cn(loaderVariants({ size }), className)}>
            <div className={cn(iconContainerVariants({ size }))}>
                {/* Arka plandaki ping animasyonu */}
                <HeartPulse className={cn(iconContainerVariants({size}), "absolute animate-ping text-green-600 dark:text-green-500 opacity-50")} />
                {/* Öndeki sabit ikon */}
                <HeartPulse className={cn(iconContainerVariants({size}), "text-green-600 dark:text-green-500")} />
            </div>
            {text && (
                // DEĞİŞİKLİK 2: Yazı kalınlaştırıldı ("font-semibold") ve text boyutu eklendi.
                <p className="text-sm md:text-base font-semibold text-muted-foreground">{text}</p>
            )}
        </div>
    );
}