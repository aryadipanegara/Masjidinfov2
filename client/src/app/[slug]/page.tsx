import Comments from "@/components/comments";
import ImageKit from "@/components/image";
import PostMenuActions from "@/components/postMenuActions";
import Search from "@/components/search";
import { IconBrandFacebook, IconBrandInstagram } from "@tabler/icons-react";
import Link from "next/link";

export default function SinglePostPage() {
  return (
    <main className="flex flex-col gap-8 py-2">
      {/* details */}
      <div className="flex gap-8">
        <div className="lg: w-3/5 flex flex-col gap-8">
          <h1 className="text-xl md:text-3xl xl:text-4xl font-semibold">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quas,
            necessitatibus officiis.
          </h1>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>Written by</span>
            <Link href="/">Jhon Doe</Link>
            <span>on</span>
            <Link href="/">Artikel</Link>
            <span>2 days ago</span>
          </div>
          <p className="text-gray-500 font-medium">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Obcaecati
            architecto repudiandae reiciendis culpa sunt officiis quos, nulla
            laborum inventore accusamus temporibus possimus adipisci veritatis
            illo placeat mollitia et incidunt nihil.
          </p>
        </div>
        <div className="hidden lg:block w-2/5">
          <ImageKit
            src="/default.jpg"
            w={600}
            h={400}
            alt="image one"
            className=" rounded-2xl"
          />
        </div>
      </div>
      {/* content */}
      <div className="flex flex-col md:flex-row gap-12">
        <div className="lg:text-lg flex flex-col gap-6 text-justify">
          {/* text */}
          <p className="">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit,
            doloremque quam! Tempore explicabo magni dicta iusto quaerat vitae.
            Ullam numquam id cupiditate adipisci cum! Cumque facilis et porro
            ipsam nisi iusto modi odit cum amet nemo, dicta a! Deserunt quisquam
            ullam earum dolorem, expedita veniam dignissimos dolore ex sapiente
            numquam?
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptas
            nostrum, necessitatibus ex accusamus commodi aliquam praesentium
            facilis rem culpa alias? Eos illo facilis consequatur fugit suscipit
            ea omnis quaerat dignissimos minus aut, nemo quos vitae deleniti
            iste amet aliquid deserunt, eveniet consectetur dolorem voluptas eum
            nam enim. Excepturi quo atque dolores officia facere numquam
            laboriosam pariatur vero voluptatum laudantium explicabo asperiores,
            delectus inventore reprehenderit natus omnis magnam? Dolor nesciunt
            et sequi qui ullam fugiat nostrum explicabo dolorum animi accusamus,
            asperiores, ipsa commodi deleniti esse blanditiis corporis! Impedit
            explicabo est, voluptatum suscipit porro, repellat consequatur
            delectus maiores quia repellendus nam voluptatibus.
          </p>
        </div>
        {/* Menu */}
        <div className="px-4 h-max sticky top-8">
          <h1 className="mt-8 mb-4 text-sm font-medium">Author</h1>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-8 ">
              <ImageKit
                src="/default.jpg"
                h={32}
                w={32}
                alt="Image sticky"
                className="rounded-full object-cover"
              />
              <Link className="text-blue-800" href="/">
                Jhon Doe
              </Link>
            </div>
            <p className="text-sm text-gray-400">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </p>
            <div className="flex gap-2">
              <Link href="/">
                <IconBrandFacebook />
              </Link>
              <Link href="/">
                <IconBrandInstagram />
              </Link>
            </div>
          </div>

          <PostMenuActions />
          <h1 className="mt-8 mb-4 text-sm font-medium">Categories</h1>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/" className=" underline">
              Artikel
            </Link>
            <Link href="/" className=" underline">
              Masjid
            </Link>
          </div>
          <h1 className="mt-8 mb-4 text-sm font-medium">Search</h1>
          <Search />
        </div>
      </div>
      <Comments />
    </main>
  );
}
