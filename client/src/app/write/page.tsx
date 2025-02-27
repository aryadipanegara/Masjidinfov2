import Write from "@/components/write";
import { checkIsAdmin } from "@/lib/checkIsAdmin";
import { redirect } from "next/navigation";

const WritePage: React.FC = async () => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    redirect("/");
  }

  return <Write />;
};

export default WritePage;
