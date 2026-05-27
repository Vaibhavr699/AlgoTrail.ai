"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

export function HeroLottie() {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("/hero-lottie.json")
      .then((res) => res.json())
      .then(setAnimationData);
  }, []);

  if (!animationData) return <div className="h-[400px]" />;

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-forest-100/50 to-emerald-50/30 -z-10" />
      <Lottie
        animationData={animationData}
        loop
        autoplay
        className="w-full max-w-lg mx-auto"
      />
    </div>
  );
}
