// app/panel/page.tsx

import { auth } from "@/auth"; // Sunucu tarafında session almak için

export default async function PanelPage() {
    const session = await auth();

    return (
        <div>
            <h1>Admin Panele Hoş Geldiniz</h1>
            <p>Bu sayfayı sadece ADMIN rolüne sahip kullanıcılar görebilir.</p>
            {session?.user && (
                <div>
                    <p>Giriş Yapan Kullanıcı (T.C.): {session.user.id}</p>
                    <p>Rol: {session.user.role}</p>
                    {/* accessToken'ı client'a göndermemek en güvenlisidir.
              Ama ihtiyaç varsa session callback'inde ekleyip burada gösterebilirsiniz. */}
                </div>
            )}
        </div>
    );
}