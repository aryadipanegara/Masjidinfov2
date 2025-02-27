import { IconSearch } from "@tabler/icons-react";
import Link from "next/link";

export default function Category() {
  return (
    <div className="hidden md:flex bg-white rounded-3xl xl:rounded-full p-4 shadow-lg items-center justify-between gap-8">
      {/* links */}
      <div className="flex items-center space-x-4">
        <CategoryLink href="/posts" active>
          All Posts
        </CategoryLink>
        <CategoryLink href="/posts/masjid">Masjid</CategoryLink>
        <CategoryLink href="/posts/artikel">Artikel</CategoryLink>
      </div>
      <div className="h-8 w-px bg-gray-300" aria-hidden="true" />
      {/* search */}
      <div className="relative flex-shrink-0">
        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search a post"
          className="pl-10 pr-4 py-2 w-64 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300"
        />
      </div>
    </div>
  );
}

interface CategoryLinkProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}

function CategoryLink({ href, children, active = false }: CategoryLinkProps) {
  return (
    <Link
      href={href}
      className={`${
        active
          ? "bg-blue-600 text-white"
          : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
      } rounded-full px-4 py-2 font-medium transition-all duration-300`}
    >
      {children}
    </Link>
  );
}
