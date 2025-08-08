import { useState, useRef, useEffect } from "react";

let paused;

function LoopingValue(speed, min = 0, max = 100) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => (paused ? prev : prev >= max ? min : prev + 1));
    }, 1000 / speed);
    return () => clearInterval(interval);
  }, [speed, min, max]);
  return value;
}

export default function TagSlider({ content, as }) {
  const As = as;
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);

  const [scrollX, setScrollX] = useState(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const velocity = useRef(0);
  const momentumFrame = useRef(null);

  const [contentWidth, setContentWidth] = useState(0);
  useEffect(() => {
    if (contentRef.current) {
      setContentWidth(contentRef.current.offsetWidth);
    }
  }, [content]);

  const progress = LoopingValue(60, 0, contentWidth);

  function stopMomentum() {
    if (momentumFrame.current) {
      cancelAnimationFrame(momentumFrame.current);
      momentumFrame.current = null;
    }
  }

  function startMomentum() {
    function step() {
      if (Math.abs(velocity.current) < 0.01) return;
      setScrollX((x) => x - velocity.current);
      velocity.current *= 0.95; // friction
      momentumFrame.current = requestAnimationFrame(step);
    }
    step();
  }

  function onMouseDown(e) {
    dragging.current = true;
    lastX.current = e.clientX;
    paused = true;
    stopMomentum();
    document.body.style.userSelect = "none";
  }
  function onMouseMove(e) {
    if (!dragging.current) return;
    const delta = e.clientX - lastX.current;
    lastX.current = e.clientX;
    setScrollX((x) => x - delta);
    velocity.current = delta;
  }
  function onMouseUp() {
    dragging.current = false;
    paused = false;
    document.body.style.userSelect = "";
    startMomentum();
  }

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  function onTouchStart(e) {
    dragging.current = true;
    paused = true;
    lastX.current = e.touches[0].clientX;
    stopMomentum();
  }
  function onTouchMove(e) {
    if (!dragging.current) return;
    const delta = e.touches[0].clientX - lastX.current;
    lastX.current = e.touches[0].clientX;
    setScrollX((x) => x - delta);
    velocity.current = delta;
  }
  function onTouchEnd() {
    dragging.current = false;
    paused = false;
    startMomentum();
  }

  const totalOffset =
    contentWidth > 0
      ? (((progress + scrollX) % contentWidth) + contentWidth) % contentWidth
      : 0;

  return (
    <div
      ref={wrapperRef}
      className="w-full overflow-hidden h-max cursor-grab select-none"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}>
      <div className="flex relative w-max gap-2" style={{ left: -totalOffset }}>
        <div className="flex gap-2" ref={contentRef}>
          {content.map((item, i) => (
            <As item={item} key={`content0-${i}`} />
          ))}
        </div>
        <div className="flex gap-2">
          {content.map((item, i) => (
            <As item={item} key={`content1-${i}`} />
          ))}
        </div>
        <div className="flex gap-2">
          {content.map((item, i) => (
            <As item={item} key={`content2-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
