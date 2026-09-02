"use client";

import { ImgHTMLAttributes, useEffect, useState } from "react";

const PLACEHOLDER = "/images/product-placeholder.svg";

type ProductImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
};

export default function ProductImage({ src, alt = "", ...props }: ProductImageProps) {
  const [current, setCurrent] = useState(src || PLACEHOLDER);

  useEffect(() => {
    setCurrent(src || PLACEHOLDER);
  }, [src]);

  return (
    <img
      {...props}
      src={current}
      alt={alt}
      onError={() => {
        if (current !== PLACEHOLDER) setCurrent(PLACEHOLDER);
      }}
    />
  );
}
