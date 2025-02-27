"use client";

import PostList from "@/components/postList";
import SideMenu from "@/components/sideMenu";
import { useState } from "react";

export default function PostListPage() {
  const [open, setOpen] = useState(false);

  return (
    <main className="">
      <h1 className="mb-8 text-2xl">Masjid</h1>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="bg-blue-800 text-sm text-white px-4 py-2 rounded-2xl mb-4 md:hidden"
      >
        {open ? "close" : "Filter or Search"}
      </button>
      <div className="flex flex-col-reverse gap-8 md:flex-row">
        <div className="">
          <PostList />
        </div>
        <div className={`${open ? "block" : "hidden"} md:block`}>
          <SideMenu />
        </div>
      </div>
    </main>
  );
}
