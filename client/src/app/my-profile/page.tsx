import { createMetadata } from "@/lib/meta-data";
import MyProfileClient from "./my-profile-client";
import { MainNavbar } from "@/components/main-navbar";
import { MainFooter } from "@/components/main-footer";

export const metadata = createMetadata({
  title: "My Profile",
  description: "Kelola informasi akun dan pengaturan pribadi Anda",
  keywords: ["profile", "akun", "pengaturan", "user", "masjid"],
});

export default function MyProfilePage() {
  return (
    <>
      <MainNavbar />
      <MyProfileClient />
      <MainFooter />
    </>
  );
}
