"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const safeImages = useMemo(() => (images.length ? images : ["/accounts/acc-01.svg"]), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [safeImages]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) => (current + 1) % safeImages.length);
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => (current - 1 + safeImages.length) % safeImages.length);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, safeImages.length]);

  const activeImage = safeImages[activeIndex];

  function goPrev() {
    setActiveIndex((current) => (current - 1 + safeImages.length) % safeImages.length);
  }

  function goNext() {
    setActiveIndex((current) => (current + 1) % safeImages.length);
  }

  function handleTouchEnd(endX: number) {
    if (touchStartX === null) return;
    const delta = endX - touchStartX;

    if (Math.abs(delta) > 40) {
      if (delta < 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    setTouchStartX(null);
  }

  return (
    <>
      <div className="product-detail-gallery">
        <button type="button" className="product-detail-hero-image" onClick={() => setIsLightboxOpen(true)}>
          <Image src={activeImage} alt={title} fill sizes="(max-width: 1024px) 100vw, 50vw" />
        </button>

        <p className="product-gallery-caption">Click vào ảnh để phóng to và lướt qua các ảnh khác.</p>

        <div className="product-detail-thumbs">
          {safeImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={`product-thumb ${activeIndex === index ? "product-thumb-active" : ""}`}
              onClick={() => setActiveIndex(index)}
            >
              <Image src={image} alt={`${title} ${index + 1}`} fill sizes="120px" />
            </button>
          ))}
        </div>
      </div>

      {isLightboxOpen && (
        <div className="product-lightbox" role="dialog" aria-modal="true" aria-label={`Ảnh ${title}`}>
          <button type="button" className="product-lightbox-backdrop" onClick={() => setIsLightboxOpen(false)} />

          <div className="product-lightbox-inner">
            <button type="button" className="product-lightbox-close" onClick={() => setIsLightboxOpen(false)}>
              <X size={20} />
            </button>

            <button type="button" className="product-lightbox-nav product-lightbox-prev" onClick={goPrev}>
              <ChevronLeft size={22} />
            </button>

            <div
              className="product-lightbox-stage"
              onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)}
              onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
            >
              <Image src={activeImage} alt={title} fill sizes="100vw" />
            </div>

            <button type="button" className="product-lightbox-nav product-lightbox-next" onClick={goNext}>
              <ChevronRight size={22} />
            </button>

            <div className="product-lightbox-footer">
              <span>
                Ảnh {activeIndex + 1} / {safeImages.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
