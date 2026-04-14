"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type ReviewItem = {
  id: string;
  productKey: string;
  productName: string;
  authorName: string;
  authorEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type AuthUser = {
  fullName?: string;
  username?: string;
  email?: string;
};

const AUTH_STORAGE_KEY = "kyo-auth-user";

function formatReviewDate(value: string) {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function renderStars(value: number) {
  return "★".repeat(Math.max(0, value)) + "☆".repeat(Math.max(0, 5 - value));
}

export default function ProductComments({
  productName,
  productKey,
}: {
  productName: string;
  productKey: string;
}) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [salutation, setSalutation] = useState<"Anh" | "Chị">("Anh");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadReviews = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/reviews?productKey=${encodeURIComponent(productKey)}`, {
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setReviews(Array.isArray(data.reviews) ? (data.reviews as ReviewItem[]) : []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const rawUser = window.localStorage.getItem(AUTH_STORAGE_KEY);

      if (!rawUser) {
        return;
      }

      const user = JSON.parse(rawUser) as AuthUser;
      setAuthorName(user.fullName || user.username || "");
      setAuthorEmail(user.email || "");
    } catch {
      return;
    }
  }, []);

  const totalReviews = reviews.length;
  const averageRating = useMemo(() => {
    if (!reviews.length) {
      return 0;
    }

    return Number(
      (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1),
    );
  }, [reviews]);

  const ratingDistribution = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((review) => review.rating === star).length;
        const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

        return {
          star,
          count,
          percentage,
        };
      }),
    [reviews, totalReviews],
  );

  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const normalizedAuthorName = authorName.trim();
    const normalizedAuthorEmail = authorEmail.trim().toLowerCase();
    const normalizedComment = comment.trim();
    const submittedName = normalizedAuthorName
      ? `${salutation} ${normalizedAuthorName}`.trim()
      : "";

    if (!submittedName || !normalizedComment) {
      setErrorMessage("Vui lòng nhập họ tên và nội dung đánh giá.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setErrorMessage("Vui lòng chọn số sao từ 1 đến 5.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productKey,
          productName,
          authorName: submittedName,
          authorEmail: normalizedAuthorEmail,
          rating,
          comment: normalizedComment,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMessage(data.error ?? "Không thể lưu đánh giá lúc này.");
        return;
      }

      setSuccessMessage("Đánh giá của bạn đã được lưu.");
      setComment("");
      setRating(5);
      await loadReviews();
    } catch {
      setErrorMessage("Không thể lưu đánh giá lúc này.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-[18px] border border-[#e5e5e5] bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)] sm:p-6">
      <h2 className="text-[1.65rem] font-bold leading-10 text-[#171717]">
        Đánh giá {productName}
      </h2>

      <div className="mt-5 overflow-hidden rounded-[12px] border border-[#dfdfdf]">
        <div className="grid lg:grid-cols-[190px_minmax(0,1fr)_260px]">
          <div className="flex flex-col items-center justify-center border-b border-[#dfdfdf] px-4 py-7 text-center lg:border-b-0 lg:border-r">
            <div className="flex items-end gap-2 text-[#ff9a1f]">
              <span className="text-[4rem] font-bold leading-none">
                {averageRating.toFixed(1)}
              </span>
              <span className="pb-2 text-[3.2rem] leading-none">★</span>
            </div>
            <p className="mt-2 text-[1.15rem] font-bold uppercase text-[#171717]">
              Đánh giá trung bình
            </p>
          </div>

          <div className="border-b border-[#dfdfdf] px-4 py-5 lg:border-b-0 lg:border-r sm:px-7">
            <div className="space-y-3">
              {ratingDistribution.map((item) => (
                <div
                  key={item.star}
                  className="grid items-center gap-3 sm:grid-cols-[52px_minmax(0,1fr)_160px]"
                >
                  <span className="text-[1rem] font-semibold text-[#111111]">
                    {item.star} ★
                  </span>
                  <div className="h-5 overflow-hidden rounded-full bg-[#f0f0f0]">
                    <div
                      className="h-full rounded-full bg-[#ffb53f] transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-[1rem] font-medium text-[#0a8fe8]">
                    {item.percentage}% | {item.count} đánh giá
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center px-5 py-7">
            <button
              type="button"
              onClick={handleScrollToForm}
              className="inline-flex h-14 min-w-[190px] items-center justify-center rounded-[6px] bg-[#0a98dd] px-6 text-[1.3rem] font-bold uppercase text-white transition hover:bg-[#0788c7]"
            >
              Đánh giá ngay
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 min-h-16 text-[1.05rem] text-[#222222]">
        {isLoading ? (
          <p>Đang tải đánh giá...</p>
        ) : reviews.length === 0 ? (
          <p>Chưa có đánh giá nào.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <article key={review.id} className="border-b border-[#ececec] pb-4 last:border-b-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[1.02rem] font-bold text-[#171717]">
                      {review.authorName}
                    </h3>
                    <p className="mt-1 text-[0.95rem] text-[#7a7a7a]">
                      {formatReviewDate(review.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[1.05rem] font-semibold tracking-[0.12em] text-[#ff9a1f]">
                      {renderStars(review.rating)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[1rem] leading-8 text-[#222222]">{review.comment}</p>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-[#e4e4e4] pt-6">
        <h3 className="text-[1.55rem] font-bold text-[#171717]">Hỏi đáp</h3>

        <form ref={formRef} onSubmit={handleSubmit} className="mt-5">
          <div className="overflow-hidden rounded-[4px] border border-[#d7d7d7]">
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="min-h-[145px] w-full resize-none px-4 py-4 text-[1rem] leading-8 text-[#171717] outline-none"
              placeholder="Mời bạn tham gia thảo luận, vui lòng nhập tiếng Việt có dấu."
            />

            <div className="border-t border-[#e5e5e5] px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[0.98rem] font-semibold text-[#171717]">Số sao:</span>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`inline-flex h-9 min-w-9 items-center justify-center rounded-[6px] border px-2 text-[0.95rem] font-semibold transition ${
                      rating === value
                        ? "border-[#ffb53f] bg-[#fff2d9] text-[#d07a00]"
                        : "border-[#dfdfdf] bg-white text-[#333333] hover:bg-[#fafafa]"
                    }`}
                  >
                    {value}★
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-[#e5e5e5] px-4 py-4">
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-[1rem] font-semibold text-[#171717]">
                  <input
                    type="radio"
                    checked={salutation === "Anh"}
                    onChange={() => setSalutation("Anh")}
                    className="h-5 w-5 accent-[#2196f3]"
                  />
                  <span>Anh</span>
                </label>

                <label className="flex items-center gap-2 text-[1rem] font-semibold text-[#171717]">
                  <input
                    type="radio"
                    checked={salutation === "Chị"}
                    onChange={() => setSalutation("Chị")}
                    className="h-5 w-5 accent-[#2196f3]"
                  />
                  <span>Chị</span>
                </label>

                <input
                  type="text"
                  value={authorName}
                  onChange={(event) => setAuthorName(event.target.value)}
                  placeholder="Họ tên (bắt buộc)"
                  className="h-12 min-w-[260px] flex-1 border border-[#ffb35c] px-4 text-[1rem] text-[#171717] outline-none"
                />

                <input
                  type="email"
                  value={authorEmail}
                  onChange={(event) => setAuthorEmail(event.target.value)}
                  placeholder="Email"
                  className="h-12 min-w-[260px] flex-1 border border-[#ffb35c] px-4 text-[1rem] text-[#171717] outline-none"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-12 items-center justify-center rounded-[4px] bg-[#ffd44f] px-5 text-[1rem] font-bold uppercase text-[#1d1d1d] transition hover:bg-[#f6c932] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Đang gửi" : "Gửi"}
                </button>
              </div>

              {errorMessage ? (
                <p className="mt-4 text-[0.98rem] font-medium text-[#ff477e]">{errorMessage}</p>
              ) : null}

              {successMessage ? (
                <p className="mt-4 text-[0.98rem] font-medium text-[#18a05d]">{successMessage}</p>
              ) : null}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
