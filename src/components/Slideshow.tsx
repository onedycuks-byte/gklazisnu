import { useEffect, useState, ReactNode, Children } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SlideshowProps {
  children: ReactNode;
  interval?: number;
  className?: string;
  showArrows?: boolean;
  autoPlay?: boolean;
}

export const Slideshow = ({ children, interval = 4500, className = "", showArrows = false, autoPlay = true }: SlideshowProps) => {
  const slides = Children.toArray(children);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), interval);
    return () => clearInterval(id);
  }, [slides.length, interval, autoPlay]);

  if (slides.length === 0) return null;

  const go = (i: number) => setIndex((i + slides.length) % slides.length);

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="min-w-full shrink-0">
            {slide}
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <>
          {showArrows && (
            <>
              <button
                onClick={() => go(index - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition"
                aria-label="Sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => go(index + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition"
                aria-label="Berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
