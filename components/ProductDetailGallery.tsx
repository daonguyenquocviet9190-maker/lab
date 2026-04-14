"use client";

import { useMemo, useState } from "react";

type ProductDetailGalleryProps = {
  name: string;
  image: string;
  hoverImage?: string;
};

const IMAGE_FALLBACK = "/images/products/product-placeholder.svg";

export default function ProductDetailGallery({
  name,
  image,
  hoverImage,
}: ProductDetailGalleryProps) {
  const images = useMemo(() => {
    const items = [image, hoverImage].filter(Boolean) as string[];
    return items.length ? [...new Set(items)] : [IMAGE_FALLBACK];
  }, [image, hoverImage]);

  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[24px] border border-[#f0e6e8] bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="aspect-[1/1] overflow-hidden rounded-[18px] bg-[#fffdfb]">
          <img
            src={activeImage}
            alt={name}
            className="h-full w-full object-contain"
            onError={(event) => {
              event.currentTarget.src = IMAGE_FALLBACK;
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((item, index) => (
          <button
            key={`${item}-${index}`}
            type="button"
            onClick={() => setActiveImage(item)}
            className={`overflow-hidden rounded-2xl border bg-white p-2 transition ${
              activeImage === item
                ? "border-[#ee4d8c] shadow-[0_10px_24px_rgba(238,77,140,0.18)]"
                : "border-[#f0e6e8] hover:border-[#ee4d8c]"
            }`}
          >
            <div className="aspect-square overflow-hidden rounded-xl bg-[#fffdfb]">
              <img
                src={item}
                alt={`${name} ${index + 1}`}
                className="h-full w-full object-contain"
                onError={(event) => {
                  event.currentTarget.src = IMAGE_FALLBACK;
                }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
