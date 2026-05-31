import React, { useState } from "react";

interface CategoryCardProps {
  title: string;
  label: string;
  itemCountDesc?: string;
  priceRangeStr?: string;
  bgImage?: string;
  index?: number;
  onClick: () => void;
  accentColor?: string;
  glowColor?: string;
  gradientFrom?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  label,
  itemCountDesc,
  priceRangeStr,
  bgImage,
  index = 0,
  onClick,
  accentColor = "#3B82F6",
  glowColor = "rgba(59,130,246,0.6)",
  gradientFrom = "#0a1f3a",
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <div
        className="custom-category-card"
        style={
          {
            animationDelay: `${index * 0.1}s`,
            "--accent": accentColor,
            "--glow": glowColor,
          } as any
        }
        tabIndex={0}
        role="button"
        aria-label={title}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      >
        {/* Banner */}
        <div className="custom-banner">
          <div
            className="custom-banner-bg"
            style={{
              backgroundImage: bgImage
                ? `url(${bgImage})`
                : "linear-gradient(45deg, #121820, #0B0D0F)",
            }}
          />
        </div>

        {/* Info row */}
        <div className="custom-info-row">
          <div className="custom-info-left">
            <h2 className="custom-cat-name">{title}</h2>
            {itemCountDesc && (
              <p className="custom-item-count">{itemCountDesc}</p>
            )}
          </div>
          {priceRangeStr && (
            <div className="custom-price-badge" style={{ color: accentColor }}>
              {priceRangeStr}
            </div>
          )}
        </div>

        {/* Hover glow border */}
        <div className={`custom-card-glow ${hovered ? "active" : ""}`} />
      </div>
    </>
  );
};
