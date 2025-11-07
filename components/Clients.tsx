"use client";

import React, { useState, useEffect } from "react";
import { InfiniteMovingCards } from "./ui/InfiniteMovingCards";
import { Testimonial } from "@/types/testimonial";

const Clients = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [companyLogos, setCompanyLogos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/testimonials");
        if (!response.ok) {
          throw new Error("Failed to fetch testimonials");
        }

        const data = await response.json();

        // Convert date strings back to Date objects and filter active testimonials
        const activeTestimonials = data.testimonials
          .filter((t: any) => t.isActive)
          .map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
          }))
          .sort((a: Testimonial, b: Testimonial) => a.order - b.order);

        setTestimonials(activeTestimonials);

        // Extract unique company logos
        const logos = activeTestimonials.map((t: Testimonial) => t.companyLogo);
        setCompanyLogos(logos);
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load testimonials"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Loading state
  if (loading) {
    return (
      <section id="testimonials" className="py-20">
        <h1 className="heading">
          Kind words from
          <span className="text-purple"> satisfied clients</span>
        </h1>
        <div className="flex items-center justify-center p-4 mt-10 min-h-[300px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white-100 text-lg">Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section id="testimonials" className="py-20">
        <h1 className="heading">
          Kind words from
          <span className="text-purple"> satisfied clients</span>
        </h1>
        <div className="flex items-center justify-center p-4 mt-10 min-h-[300px]">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-white-100 text-lg mb-2">
              Failed to load testimonials
            </p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (testimonials.length === 0) {
    return (
      <section id="testimonials" className="py-20">
        <h1 className="heading">
          Kind words from
          <span className="text-purple"> satisfied clients</span>
        </h1>
        <div className="flex items-center justify-center p-4 mt-10 min-h-[300px]">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-white-100 text-lg mb-2">No testimonials yet</p>
            <p className="text-gray-400 text-sm">
              Check back soon for client feedback!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-20">
      <h1 className="heading">
        Kind words from
        <span className="text-purple"> satisfied clients</span>
      </h1>

      <div className="flex flex-col items-center max-lg:mt-10">
        <div className="h-[50vh] md:h-[30rem] rounded-md flex flex-col antialiased items-center justify-center relative overflow-hidden">
          <InfiniteMovingCards
            items={testimonials}
            direction="right"
            speed="slow"
          />
        </div>

        {/* Company Logos */}
        {companyLogos.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-16 max-lg:mt-10">
            {companyLogos.map((logo, index) => (
              <div
                key={index}
                className="flex md:max-w-60 max-w-32 gap-2 items-center justify-center"
              >
                <img
                  src={logo}
                  alt={`Company ${index + 1}`}
                  className="md:w-24 w-20 h-auto object-contain"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Clients;
