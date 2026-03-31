import React from "react";

export default function HeroGallery() {
  return (
    <div className="relative flex justify-center items-center w-full group">
      {/* Glowing effect on hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/0 via-teal-400/0 to-purple-400/0 group-hover:from-blue-400/30 group-hover:via-teal-400/30 group-hover:to-purple-400/30 blur-xl transition-all duration-500 -z-10"></div>


    </div>
  );
}
