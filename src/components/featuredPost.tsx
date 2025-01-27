import Link from "next/link";
import ImageKit from "./image";

export default function FeaturedPost() {
  return (
    <div className="mt-8 flex flex-col lg:flex-row gap-8">
      {/* Fisrtpost */}
      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        {/* image */}
        <ImageKit
          src="/muhammadan.jpg"
          className="rounded-3xl object-cover"
          alt="featured1"
          w={895}
          h={600}
        />
        {/* details */}
        <div className="flex items-center gap-4">
          <h1 className="font-semibold lg:text-lg">01.</h1>
          <Link href="/" className="text-blue-800 lg:text-lg">
            Artikel
          </Link>
          <span className="text-gray-500">2 days ago</span>
        </div>
        {/* title */}
        <Link
          href="/test"
          className="text-xl lg:text-3xl font-semibold lg:font-bold"
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero
          perspiciatis provident aspernatur
        </Link>
      </div>
      {/* orhters */}
      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        {/* second */}
        <div className="lg:h-1/3 flex justify-between gap-4">
          <div className="w-1/3 aspect-video">
            <ImageKit
              src="/muhammadan.jpg"
              className="rounded-3xl object-cover"
              alt="one"
              w={298}
              h={200}
            />
          </div>
          {/* detail and title */}
          <div className="w-2/3">
            {/* details */}
            <div className="flex items-center gap-4 text-sm lg:text-base mb-4">
              <h1 className="font-semibold">02.</h1>
              <Link href="/" className="text-blue-500">
                Artikel
              </Link>
              <span className="text-gray-500 text-sm">2 days ago</span>
            </div>
            {/* title */}
            <Link
              href="/test"
              className="text-base sm:text-lg md:text-2xl lg:text-xl xl:text-2xl font-medium"
            >
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos,
            </Link>
          </div>
        </div>
        {/* two */}
        <div className="lg:h-1/3 flex justify-between gap-4">
          <div className="w-1/3 aspect-video">
            <ImageKit
              src="/muhammadan.jpg"
              className="rounded-3xl object-cover"
              alt="one"
              w={298}
              h={200}
            />
          </div>
          {/* detail and title */}
          <div className="w-2/3">
            {/* details */}
            <div className="flex items-center gap-4 text-sm lg:text-base mb-4">
              <h1 className="font-semibold">02.</h1>
              <Link href="/" className="text-blue-500">
                Artikel
              </Link>
              <span className="text-gray-500 text-sm">2 days ago</span>
            </div>
            {/* title */}
            <Link
              href="/test"
              className="text-base sm:text-lg md:text-2xl lg:text-xl xl:text-2xl font-medium"
            >
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos,
            </Link>
          </div>
        </div>
        {/* three */}
        <div className="lg:h-1/3 flex justify-between gap-4">
          <div className="w-1/3 aspect-video">
            <ImageKit
              src="/muhammadan.jpg"
              className="rounded-3xl object-cover"
              alt="one"
              w={298}
              h={200}
            />
          </div>
          {/* detail and title */}
          <div className="w-2/3">
            {/* details */}
            <div className="flex items-center gap-4 text-sm lg:text-base mb-4">
              <h1 className="font-semibold">02.</h1>
              <Link href="/" className="text-blue-500">
                Artikel
              </Link>
              <span className="text-gray-500 text-sm">2 days ago</span>
            </div>
            {/* title */}
            <Link
              href="/test"
              className="text-base sm:text-lg md:text-2xl lg:text-xl xl:text-2xl font-medium"
            >
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos,
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
