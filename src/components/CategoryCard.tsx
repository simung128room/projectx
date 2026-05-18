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
  accentColor = "#1E90FF",
  glowColor = "rgba(30,144,255,0.6)",
  gradientFrom = "#0a1f3a",
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <style>{`
        .custom-category-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: #0B0F14;
          border: 1.5px solid rgba(255,255,255,0.08);
          cursor: pointer;
          animation: fadeUp 0.5s ease both;
          transition: transform 0.25s ease, border-color 0.25s ease;
          text-align: left;
        }
        .custom-category-card:hover {
          transform: translateY(-3px);
          border-color: var(--accent);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* --- Banner --- */
        .custom-banner {
          position: relative;
          aspect-ratio: 4 / 1;
          overflow: hidden;
        }

        .custom-banner-bg {
          position: absolute; inset: 0;
          background-size: cover;
          background-position: center;
          transition: transform 0.4s ease;
        }
        .custom-category-card:hover .custom-banner-bg { transform: scale(1.05); }

        .custom-banner-overlay {
          position: absolute; inset: 0;
        }

        .custom-banner-dots {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 18px 18px;
          opacity: 0.5;
        }

        /* Watermark strip */
        .custom-watermark-strip {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(2px);
          padding: 4px 0;
          display: flex;
          gap: 16px;
          overflow: hidden;
          white-space: nowrap;
        }
        .custom-watermark-strip span {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.55);
          letter-spacing: 1px;
          flex-shrink: 0;
        }

        /* APEX STORE logo */
        .custom-og-logo {
          position: absolute;
          bottom: 24px; left: 14px;
          font-weight: 800;
          font-size: 15px;
          color: #fff;
          letter-spacing: 0.5px;
          text-shadow: 0 0 12px rgba(0,0,0,0.8);
          display: flex; align-items: center; gap: 0;
          font-style: italic;
        }

        /* Category label */
        .custom-cat-label-group {
          position: absolute;
          top: 14px; right: 14px;
          text-align: right;
          text-shadow: 0 2px 12px rgba(0,0,0,0.7);
        }
        .custom-cat-label-th {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.5px;
          font-style: italic;
        }
        .custom-cat-label-en {
          display: block;
          font-size: 28px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.5px;
          text-shadow: 0 0 24px var(--glow), 0 2px 8px rgba(0,0,0,0.8);
          font-style: italic;
        }

        /* --- Info row --- */
        .custom-info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px 16px;
          gap: 12px;
        }

        .custom-info-left { flex: 1; }

        .custom-cat-name {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.2px;
          line-height: 1.2;
        }

        .custom-item-count {
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          margin-top: 3px;
        }

        .custom-price-badge {
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
          letter-spacing: 0.2px;
          text-shadow: 0 0 12px var(--glow);
        }

        /* Glow border */
        .custom-card-glow {
          position: absolute; inset: 0;
          border-radius: 16px;
          pointer-events: none;
          border: 2px solid transparent;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .custom-card-glow.active {
          border-color: var(--accent);
          box-shadow: inset 0 0 20px var(--glow), 0 0 20px var(--glow);
        }
      `}</style>
      <div
        className="custom-category-card"
        style={
          {
            animationDelay: `${index * 0.1}s`,
            "--accent": accentColor,
            "--glow": glowColor,
          } as any
        }
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
      >
        {/* Banner */}
        <div className="custom-banner">
          <div
            className="custom-banner-bg"
            style={{
              backgroundImage: bgImage
                ? `url(${bgImage})`
                : "linear-gradient(45deg, #121820, #0B0F14)",
              filter: title === 'ดูสินค้าทั้งหมด' ? "brightness(0.55) saturate(1.2)" : undefined
            }}
          />

          {title === 'ดูสินค้าทั้งหมด' && (
            <>
              <div
                className="custom-banner-overlay"
                style={{
                  background: `linear-gradient(120deg, ${gradientFrom}cc 30%, transparent 70%)`,
                }}
              />
              <div className="custom-banner-dots" />

              {/* Shop watermark strip */}
              <div className="custom-watermark-strip">
                {Array(8)
                  .fill("APEX STORE")
                  .map((t, i) => (
                    <span key={i}>{t}</span>
                  ))}
              </div>

              {/* APEX STORE logo */}
              <div className="custom-og-logo">
                <span className="og-text">APEX STOR</span>
                <span style={{ display: "inline-block", transform: "scaleX(-1) rotate(180deg) translateY(-1px)", color: "#fff" }}>E</span>
              </div>

              {/* Category label */}
              <div className="custom-cat-label-group">
                <span className="custom-cat-label-th">{label}</span>
                <span className="custom-cat-label-en" style={{ color: accentColor }}>
                  {title}
                </span>
              </div>
            </>
          )}
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
