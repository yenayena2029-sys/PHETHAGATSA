"use client";

import Link from "next/link";

interface HeroSliderProps {
  lang: string;
  imageUrl?: string;
}

export default function HeroSlider({ lang, imageUrl }: HeroSliderProps) {
  const fallbackImage = "/hero_phethagatsa.png";

  return (
    <section className="hero-slider" aria-label="Featured collection">
      <div className="hero-slider-art" aria-hidden="true" />
      <div className="container hero-slider-container">
        <div className="hero-slider-copy">
          <span className="hero-slider-eyebrow">Modern botanical care</span>
          <h1>Crafted for radiance.</h1>
          <p>Thoughtful essentials made with nourishing ingredients for your everyday ritual.</p>
          <div className="hero-slider-actions">
            <Link href={`/${lang}/shop`} className="btn btn-primary hero-slider-primary">
              EXPLORE BESTSELLERS
            </Link>
            <Link href={`/${lang}/shop?isFeatured=true`} className="btn hero-slider-secondary">
              VIEW FEATURED
            </Link>
          </div>
          <div className="hero-slider-trust">
            <span>Natural ingredients</span>
            <span>•</span>
            <span>Cruelty-free</span>
            <span>•</span>
            <span>Pan-African delivery</span>
          </div>
        </div>
        <div className="hero-slider-image-frame">
          <img
            src={imageUrl || fallbackImage}
            alt="Crafted for radiance collection"
            onError={(event) => {
              event.currentTarget.src = fallbackImage;
            }}
          />
        </div>
      </div>
    </section>
  );
}
