"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import authPostsivaGlassPanel from "@/assets/images/auth-postsiva-glass-panel.png";

export function AuthSideVisual(): React.ReactElement {
  return (
    <motion.section
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative hidden min-h-screen overflow-hidden bg-[#f1f3fe] lg:block lg:w-[55%]"
      aria-hidden
    >
      <Image
        src={authPostsivaGlassPanel}
        alt=""
        priority
        fill
        className="object-cover object-center"
        sizes="55vw"
        placeholder="blur"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/45 via-white/5 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,88,188,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(0,88,188,0.45) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </motion.section>
  );
}
