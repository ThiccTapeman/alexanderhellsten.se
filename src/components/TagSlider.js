"use client";

import { useEffect, useRef } from "react";

export default function TagSlider({ content, as: As, listView = false, ...props }) {
  if (listView) return <div className="w-full"><div className="flex flex-wrap gap-2 w-full">{content.map((item, i) => <As item={item} key={i} {...props} />)}</div></div>;
  return <ScrollingTags content={content} as={As} {...props} />;
}

function ScrollingTags({ content, as: As, ...props }) {
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    const group = contentRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animation, width = 0, duration = 0, pointer = null, lastX = 0, velocity = 0, frame;
    let inView = false;
    const syncPlayback = () => {
      if (!animation) return;
      if (inView && !document.hidden && !reducedMotion.matches && pointer === null && !frame) animation.play();
      else animation.pause();
    };
    const resize = () => {
      const nextWidth = group.getBoundingClientRect().width + 8;
      if (nextWidth === width || nextWidth <= 8) return;
      const time = Number(animation?.currentTime || 0);
      animation?.cancel();
      width = nextWidth;
      duration = width / 60 * 1000;
      animation = track.animate([{ transform: "translateX(0)" }, { transform: "translateX(-" + width + "px)" }], { duration, iterations: Infinity, easing: "linear" });
      animation.currentTime = time % duration;
      syncPlayback();
    };
    const shift = (pixels) => {
      if (!animation) return;
      const time = Number(animation.currentTime || 0) - pixels / 60 * 1000;
      animation.currentTime = ((time % duration) + duration) % duration;
    };
    const stopMomentum = () => { cancelAnimationFrame(frame); frame = undefined; };
    const down = (event) => {
      if (event.button !== 0) return;
      stopMomentum(); pointer = event.pointerId; lastX = event.clientX; velocity = 0;
      wrapper.setPointerCapture(pointer); syncPlayback();
    };
    const move = (event) => {
      if (event.pointerId !== pointer) return;
      velocity = event.clientX - lastX; lastX = event.clientX; shift(velocity);
    };
    const up = (event) => {
      if (event.pointerId !== pointer) return;
      pointer = null;
      if (event.type === "pointercancel" || reducedMotion.matches) { syncPlayback(); return; }
      let previous = performance.now();
      const step = (now) => {
        const elapsed = Math.min(32, now - previous) / (1000 / 60); previous = now;
        shift(velocity * elapsed); velocity *= Math.pow(0.95, elapsed);
        if (Math.abs(velocity) > 0.1 && inView && !document.hidden) frame = requestAnimationFrame(step);
        else { frame = undefined; syncPlayback(); }
      };
      frame = requestAnimationFrame(step);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(group);
    const visibility = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncPlayback(); });
    visibility.observe(wrapper);
    document.addEventListener("visibilitychange", syncPlayback);
    reducedMotion.addEventListener("change", syncPlayback);
    wrapper.addEventListener("pointerdown", down);
    wrapper.addEventListener("pointermove", move);
    wrapper.addEventListener("pointerup", up);
    wrapper.addEventListener("pointercancel", up);
    wrapper.addEventListener("lostpointercapture", up);
    return () => {
      stopMomentum(); animation?.cancel(); observer.disconnect(); visibility.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      reducedMotion.removeEventListener("change", syncPlayback);
      wrapper.removeEventListener("pointerdown", down);
      wrapper.removeEventListener("pointermove", move);
      wrapper.removeEventListener("pointerup", up);
      wrapper.removeEventListener("pointercancel", up);
      wrapper.removeEventListener("lostpointercapture", up);
    };
  }, [content]);

  return <div ref={wrapperRef} className="w-full overflow-hidden cursor-grab active:cursor-grabbing select-none touch-pan-y">
    <div ref={trackRef} className="flex w-max gap-2">
      <div ref={contentRef} className="flex gap-2 shrink-0">{content.map((item, i) => <As item={item} key={i} {...props} />)}</div>
      {[1, 2].map((copy) => <div key={copy} aria-hidden="true" className="flex gap-2 shrink-0">{content.map((item, i) => <As item={item} key={i} {...props} />)}</div>)}
    </div>
  </div>;
}
