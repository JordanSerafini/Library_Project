import React, {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  ReactNode,
} from "react";
import { gsap } from "gsap";

interface InfiniteScrollerProps {
  items: ReactNode[];
  speed?: number; // Vitesse de défilement en pixels par seconde
  gap?: number; // Espace entre chaque élément en pixels
  className?: string; // Classes CSS supplémentaires pour le conteneur
  itemClassName?: string; // Classes CSS supplémentaires pour chaque élément
  direction?: "left" | "right"; // Direction du défilement
  pauseOnHover?: boolean; // Pause lorsque l'utilisateur survole la zone
}

const InfiniteScroller: React.FC<InfiniteScrollerProps> = ({
  items,
  speed = 50,
  gap = 20,
  className = "",
  itemClassName = "",
  direction = "left",
  pauseOnHover = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [clonedItems, setClonedItems] = useState<ReactNode[]>([]);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  /**
   * Fonction utilitaire pour limiter les appels fréquents (debounce).
   */
  const debounce = (func: () => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(func, delay);
    };
  };

  /**
   * Étape 1 : Calcul des dimensions et clonage des items.
   */
  useLayoutEffect(() => {
    if (!containerRef.current || !wrapperRef.current) return;

    // Réinitialiser l'animation précédente
    if (tweenRef.current) {
      tweenRef.current.kill();
      tweenRef.current = null;
    }

    const containerWidth = containerRef.current.offsetWidth;
    const itemsArray = Array.from(wrapperRef.current.children) as HTMLElement[];

    let totalWidth = 0;
    itemsArray.forEach((el, i) => {
      totalWidth += el.offsetWidth;
      if (i < itemsArray.length - 1) totalWidth += gap;
    });

    if (totalWidth <= 0 || itemsArray.length === 0) {
      setClonedItems(items); // Aucun clonage nécessaire
      return;
    }

    const cloneCount = Math.ceil(containerWidth / totalWidth) + 2;
    const repeatedItems = Array.from({ length: cloneCount }, () => items).flat();
    setClonedItems(repeatedItems);
  }, [items, gap]);

  /**
   * Étape 2 : Animation GSAP (scroller infini).
   */
  useEffect(() => {
    if (!containerRef.current || !wrapperRef.current || clonedItems.length === 0)
      return;

    if (tweenRef.current) tweenRef.current.kill();

    const wrapper = wrapperRef.current;
    const totalWidth = wrapper.scrollWidth;
    const containerWidth = containerRef.current.offsetWidth;
    const distance =
      direction === "left"
        ? -(totalWidth - containerWidth)
        : totalWidth - containerWidth;
    const duration = Math.abs(distance) / speed;

    tweenRef.current = gsap.to(wrapper, {
      x: distance,
      duration,
      ease: "linear",
      repeat: -1,
    });
  }, [clonedItems, speed, direction]);

  /**
   * Étape 3 : Pause au survol.
   */
  useEffect(() => {
    if (!pauseOnHover || !containerRef.current) return;

    const container = containerRef.current;

    const handleMouseEnter = () => {
      if (tweenRef.current) tweenRef.current.pause();
    };

    const handleMouseLeave = () => {
      if (tweenRef.current) tweenRef.current.resume();
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [pauseOnHover]);

  /**
   * Étape 4 : Gestion du redimensionnement.
   */
  useEffect(() => {
    const handleResize = debounce(() => setClonedItems([]), 100);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden whitespace-nowrap ${className}`}
      style={{ width: "100%" }}
    >
      <div
        ref={wrapperRef}
        style={{ display: "inline-flex", gap: `${gap}px` }}
      >
        {clonedItems.map((item, index) => (
          <div key={index} className={itemClassName}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfiniteScroller;
