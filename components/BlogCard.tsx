"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

type BlogPost = {
  id: number;
  title: string;
  image: string;
  href?: string;
};

const blogPlaceholder = "/images/blog/blog-placeholder.svg";

export default function BlogCard({ post }: { post: BlogPost }) {
  const [imageSrc, setImageSrc] = useState(post.image || blogPlaceholder);

  return (
    <article className="group overflow-hidden rounded-[0.2rem] bg-white/10 shadow-[0_12px_26px_rgba(133,52,83,0.12)]">
      <a
        href={post.href ?? "#"}
        className="relative block aspect-[1.28/0.72] overflow-hidden"
      >
        <img
          src={imageSrc}
          alt={post.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => {
            if (imageSrc !== blogPlaceholder) {
              setImageSrc(blogPlaceholder);
            }
          }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,10,16,0.04)_0%,rgba(22,10,16,0.14)_44%,rgba(22,10,16,0.58)_100%)]" />

        <div className="absolute inset-x-0 bottom-0 p-4 text-center md:p-5">
          <h3 className="mx-auto max-w-[92%] text-[0.82rem] font-semibold uppercase leading-6 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] md:text-[0.94rem]">
            {post.title}
          </h3>

          <span className="mt-3 inline-flex min-h-8 items-center justify-center border border-white px-4 text-[0.82rem] font-semibold text-white transition group-hover:bg-white group-hover:text-[#ef3f7f]">
            Xem
          </span>
        </div>
      </a>
    </article>
  );
}
