import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          <Card className="sm:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle>Selamat Datang di Dashboard Admin!</CardTitle>
              <CardDescription className="max-w-lg text-balance leading-relaxed">
                Kelola pengguna, pengaturan, dan data lainnya di sini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Tambahkan konten atau statistik di sini */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Pengguna</CardDescription>
              <CardTitle className="text-4xl">1,234</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                +20.1% dari bulan lalu
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Admin Aktif</CardDescription>
              <CardTitle className="text-4xl">15</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">5 Super Admin</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
