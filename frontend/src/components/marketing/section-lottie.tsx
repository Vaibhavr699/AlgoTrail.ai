"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

export function SectionLottie({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(src)
      .then((res) => res.json())
      .then(setData);
  }, [src]);

  if (!data) return <div className="h-[300px]" />;

  return (
    <Lottie
      animationData={data}
      loop
      autoplay
      className={className || "w-full max-w-md mx-auto"}
    />
  );
}
