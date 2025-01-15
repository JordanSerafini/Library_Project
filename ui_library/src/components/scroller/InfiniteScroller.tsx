import React, {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  ReactNode,
} from "react";
import { gsap } from "gsap";

interface InfiniteScrollerProps {
  /**
   * Array of React nodes (text, icons, images, etc.).
   */
  items: ReactNode[];

  /**
   * Scrolling speed in pixels per second.
   * @default 50
   */
  speed?: number;

  /**
   * Gap (in px) between each item.
   * @default 20
   */
  gap?: number;

  /**
   * Allows you to add extra classes to the outer container.
   */
  className?: string;

  /**
   * Allows you to add extra classes to each item wrapper.
   */
  itemClassName?: string;

  /**
   * Scrolling direction: `"left"` (default) or `"right"`.
   */
  direction?: "left" | "right";

  /**
   * Whether to pause scrolling when hovering the container.
   * @default false
   */
  pauseOnHover?: boolean;
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
   * Step 1: Measure item widths and create the cloned array in state.
   */
  useLayoutEffect(() => {
    if (!containerRef.current || !wrapperRef.current) return;

    // Reset any existing animation
    if (tweenRef.current) {
      tweenRef.current.kill();
      tweenRef.current = null;
    }

    const containerWidth = containerRef.current.offsetWidth;
    const itemsArray = Array.from(wrapperRef.current.children) as HTMLElement[];

    // Measure the total width of the original items (including gap).
    let totalWidth = 0;
    itemsArray.forEach((el, i) => {
      totalWidth += el.offsetWidth;
      // Add gap after each item, except the last in the original list
      if (i < itemsArray.length - 1) {
        totalWidth += gap;
      }
    });

    // If there's literally no width or no items, avoid dividing by zero.
    if (totalWidth <= 0 || itemsArray.length === 0) {
      setClonedItems(items);
      return;
    }

    // Calculate how many times we need to repeat the items so that
    // they at least fill the container ~twice to create the looping effect.
    const cloneCount = Math.ceil(containerWidth / totalWidth) + 2;

    // Create an array containing the original items repeated.
    const repeated = Array.from({ length: cloneCount }, () => items).flat();

    setClonedItems(repeated);
  }, [items, gap]);

  /**
   * Step 2: Once we have the cloned items in the DOM, animate with GSAP.
   */
  useEffect(() => {
    if (!containerRef.current || !wrapperRef.current) return;
    if (clonedItems.length === 0) return;

    // Kill old tween if present
    if (tweenRef.current) {
      tweenRef.current.kill();
      tweenRef.current = null;
    }

    // const container = containerRef.current;
    const wrapper = wrapperRef.current;

    // Measure final total width
    const totalWidth = wrapper.scrollWidth;
    // const containerWidth = container.offsetWidth;

    // Decide animation direction
    // If "left", we move x from 0 to -totalWidth/2 (or some portion).
    // If "right", we do the reverse.
    const distance = direction === "left" ? -totalWidth : totalWidth;

    // Duration is computed by speed (px/s).
    // We want to move totalWidth by speed px/s => time = distance / speed
    const duration = Math.abs(distance) / speed;

    // Animate
    tweenRef.current = gsap.to(wrapper, {
      x: distance,
      duration,
      ease: "linear",
      repeat: -1,
    });
  }, [clonedItems, speed, direction]);

  /**
   * Step 3: Pause on hover (optional).
   */
  useEffect(() => {
    if (!pauseOnHover || !containerRef.current) return;

    const container = containerRef.current;

    const handleMouseEnter = () => {
      if (tweenRef.current) {
        tweenRef.current.pause();
      }
    };

    const handleMouseLeave = () => {
      if (tweenRef.current) {
        tweenRef.current.resume();
      }
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [pauseOnHover]);

  /**
   * Step 4: Handle window resize by re-measuring and re-cloning.
   */
  useEffect(() => {
    const handleResize = () => {
      setClonedItems([]); // Force re-layout
      // A small timeout ensures the DOM is updated before we re-measure
      setTimeout(() => {
        if (containerRef.current && wrapperRef.current) {
          // Trigger the layout effect again
          const event = new Event("resize-trigger");
          containerRef.current.dispatchEvent(event);
        }
      }, 50);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden whitespace-nowrap ${className}`}
      style={{ width: "100%" }} // Or your desired width
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
