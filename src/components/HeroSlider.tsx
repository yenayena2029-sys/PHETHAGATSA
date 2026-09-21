"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroSliderProps {
  lang: string;
  imageUrl?: string;
}

export default function HeroSlider({ lang, imageUrl }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const fallbackImage = "/hero_botanical.png";

  const slides = [
    {
      eyebrow: "Modern botanical care",
      title: "Crafted for radiance.",
      subtitle: "Thoughtful essentials made with nourishing ingredients for your everyday ritual.",
      image: imageUrl || fallbackImage,
      cta: "EXPLORE BESTSELLERS",
    },
    {
      eyebrow: "Wellness, delivered",
      title: "Glow in your element.",
      subtitle: "Discover clean, conscious products inspired by the richness of Africa.",
      image: imageUrl || fallbackImage,
      cta: "SHOP WELLNESS",
    },
  ];

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [isPaused, slides.length]);

  return (
    <section
      className="hero-slider"
      aria-label="Featured collections"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="hero-slider-art" aria-hidden="true" />
      {slides.map((slide, index) => (
        <div
          key={`${slide.title}-${index}`}
          className={`hero-slide ${index === activeIndex ? "hero-slide-active" : ""}`}
          aria-hidden={index !== activeIndex}
        >
          <div className="container hero-slider-container">
            <div className="hero-slider-copy">
              <span className="hero-slider-eyebrow">{slide.eyebrow}</span>
              <h1>{slide.title}</h1>
              <p>{slide.subtitle}</p>
              <div className="hero-slider-actions">
                <Link href={`/${lang}/shop`} className="btn btn-primary hero-slider-primary">
                  {slide.cta}
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
                src={slide.image}
                alt={`${slide.title} collection`}
                onError={(event) => {
                  event.currentTarget.src = fallbackImage;
                }}
              />
            </div>
          </div>
        </div>
      ))}

      <button
        className="hero-slider-arrow hero-slider-arrow-left"
        type="button"
        aria-label="Previous slide"
        onClick={() => setActiveIndex((activeIndex - 1 + slides.length) % slides.length)}
      >
        <ChevronLeft size={20} />
      </button>
      <button
        className="hero-slider-arrow hero-slider-arrow-right"
        type="button"
        aria-label="Next slide"
        onClick={() => setActiveIndex((activeIndex + 1) % slides.length)}
      >
        <ChevronRight size={20} />
      </button>
      <div className="hero-slider-dots" aria-label="Choose a slide">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`Show slide ${index + 1}`}
            aria-current={index === activeIndex}
            className={`hero-slider-dot ${index === activeIndex ? "hero-slider-dot-active" : ""}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </section>
  );
}
