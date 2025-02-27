"use client";
import { IKImage } from "imagekitio-next";

const UrlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;

interface ImageProps {
  src: string;
  className?: string;
  w: number;
  h: number;
  alt: string;
}

export default function ImageKit({ src, className, w, h, alt }: ImageProps) {
  return (
    <IKImage
      urlEndpoint={UrlEndpoint}
      path={src}
      className={className}
      alt={alt}
      loading="lazy"
      lqip={{ active: true, quality: 20 }}
      width={w}
      height={h}
    />
  );
}
