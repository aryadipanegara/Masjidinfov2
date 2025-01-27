import { IconSearch } from "@tabler/icons-react";
import Link from "next/link";

export default function Category() {
  return (
    <div className="hidden md:flex bg-white rounded-3xl xl:rounded-full p-4 shadow-lg items-center justify-center gap-8 ">
      {/* links */}
      <div className="flex-1 flex items-center justify-between flex-wrap">
        <Link
          href="/posts"
          className="bg-blue-800 text-white rounded-full p-4 py-2"
        >
          All Posts
        </Link>
        <Link
          href="/posts"
          className="hover:bg-blue-50 text-white rounded-full p-4 py-2"
        >
          Masjid
        </Link>
        <Link
          href="/posts"
          className="hover:bg-blue-50 text-white rounded-full p-4 py-2"
        >
          Artikel
        </Link>
      </div>
      <span className="text-xl font-medium">|</span>
      {/* search */}
      <div className="bg-gray-100 p-2 rounded-full flex items-center gap-2">
        <IconSearch className="text-white" />

        <input
          type="text"
          placeholder="search a post"
          className="bg-transparent"
        />
      </div>
    </div>
  );
}
