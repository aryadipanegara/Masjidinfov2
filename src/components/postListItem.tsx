import Link from "next/link";
import ImageKit from "./image";

export default function PostListItem() {
  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* image */}
      <div className="md:hiddem xl:block xl:w-1/3">
        <ImageKit
          src="/default.jpg"
          className="rounded-2xl object-cover"
          w={735}
          h={735}
          alt=""
        />
      </div>
      {/* details */}
      <div className="flex flex-col gap-4 xl:2/3">
        <Link href="/test" className="text-4xl font-semibold">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt
          consequatur vero perspiciatis suscipit. Quas iste libero repellat
          rerum eius fugiat incidunt vel omnis aspernatur? Obcaecati soluta ipsa
          ipsum sequi eius?
        </Link>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span>Written by</span>
          <Link href="/test" className="text-blue-800">
            Jhon doe
          </Link>
          <span>on</span>
          <Link href="/test" className="text-blue-800">
            Masjid
          </Link>
          <span>2 days ago</span>
        </div>
        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Omnis
          temporibus eaque quibusdam cumque dignissimos esse accusantium facere
          repudiandae corporis harum incidunt blanditiis minus deserunt eum,
          iure, ut, aliquam ducimus. Exercitationem.
        </p>
        <Link href="/test" className="underline text-blue800 text-sm">
          Read More
        </Link>
      </div>
    </div>
  );
}
