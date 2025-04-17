import React from "react";
import logoImage from "@assets/0e8d7186-739b-4184-838b-3a4558ed25d6.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  // Size values based on design
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-20 h-20",
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex-shrink-0`}>
      <img src={logoImage} alt="ParkPal Logo" className="w-full h-full object-contain" />
    </div>
  );
}

export default Logo;
