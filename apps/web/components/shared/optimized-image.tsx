"use client";

import Image, { type ImageProps } from "next/image";

type OptimizedImageProps = Omit<ImageProps, "alt"> & {
  alt: string;
};

export function OptimizedImage({
  alt,
  loading = "lazy",
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      alt={alt}
      loading={loading}
      {...props}
    />
  );
}
