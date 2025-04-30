// src/components/FurnitureCarousel.jsx

import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const images = [
  {
    src: "https://images.unsplash.com/photo-1588854337221-cac86c69dcbf?auto=format&fit=crop&w=1200&q=80",
    alt: "Luxury Sofa",
  },
  {
    src: "https://images.unsplash.com/photo-1615873968403-89dfe03d871f?auto=format&fit=crop&w=1200&q=80",
    alt: "Wooden Dining",
  },
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    alt: "Bedroom Setup",
  },
];

const FurnitureCarousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4500,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 mt-16">
      <Slider {...settings}>
        {images.map((item, index) => (
          <div key={index}>
            <img
              src={item.src}
              alt={item.alt}
              className="w-full h-[500px] object-cover rounded-xl shadow-md"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default FurnitureCarousel;
