"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="product-detail-gallery">
      <div className="product-detail-hero-image">
        <Image src={activeImage} alt={title} fill sizes="(max-width: 1024px) 100vw, 50vw" />
      </div>
      <div className="product-detail-thumbs">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            className={`product-thumb ${activeImage === image ? "product-thumb-active" : ""}`}
            onClick={() => setActiveImage(image)}
          >
            <Image src={image} alt={`${title} ${index + 1}`} fill sizes="120px" />
          </button>
        ))}
      </div>
    </div>
  );
}
