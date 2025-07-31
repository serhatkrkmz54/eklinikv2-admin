export default function SettingsRootPage() {
    return (
        <div className="flex h-full min-h-[50vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="text-center">
                <h2 className="text-2xl font-semibold">Ayarlar Paneline Hoş Geldiniz</h2>
                <p className="mt-2 text-muted-foreground">
                    Lütfen soldaki menüden yönetmek istediğiniz bir kategoriyi seçin.
                </p>
            </div>
        </div>
    );
}