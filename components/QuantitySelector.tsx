"use client";

import { useState } from "react";

type QuantitySelectorProps = {
  initialValue?: number;
  min?: number;
};

export default function QuantitySelector({
  initialValue = 1,
  min = 1,
}: QuantitySelectorProps) {
  const safeInitialValue = Math.max(initialValue, min);
  const [quantity, setQuantity] = useState(safeInitialValue);

  function decrease() {
    setQuantity((current) => Math.max(min, current - 1));
  }

  function increase() {
    setQuantity((current) => current + 1);
  }

  function handleChange(value: string) {
    if (value === "") {
      setQuantity(min);
      return;
    }

    const nextValue = Number(value);

    if (Number.isNaN(nextValue)) {
      return;
    }

    setQuantity(Math.max(min, nextValue));
  }

  return (
    <div className="flex items-center overflow-hidden rounded-xl border border-[#e9dfe2]">
      <button
        type="button"
        onClick={decrease}
        disabled={quantity <= min}
        className="h-12 w-10 text-[1.35rem] text-slate-700 transition hover:bg-[#fff4f8] disabled:cursor-not-allowed disabled:opacity-50"
      >
        -
      </button>
      <input
        type="number"
        min={min}
        value={quantity}
        onChange={(event) => handleChange(event.target.value)}
        className="h-12 w-12 border-x border-[#e9dfe2] text-center text-[1rem] font-semibold text-slate-900 outline-none"
      />
      <button
        type="button"
        onClick={increase}
        className="h-12 w-10 text-[1.35rem] text-slate-700 transition hover:bg-[#fff4f8]"
      >
        +
      </button>
    </div>
  );
}
