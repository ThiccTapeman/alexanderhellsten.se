// components/Loader.js
import { Bouncy } from "ldrs/react";
import "ldrs/react/Bouncy.css";

export default function Loader({ visible }) {
  return (
    <div className="w-screen h-screen fixed left-0 top-0 z-50 flex pointer-events-none">
      <div
        className={
          "w-full bg-white z-50 absolute bottom-0 transition-all duration-300 " +
          (visible ? "h-1/2" : "h-0")
        }></div>
      <div
        className={
          "w-full bg-white z-50 absolute top-0 transition-all duration-300 hidden md:block " +
          (visible ? "h-1/2" : "h-0")
        }></div>
      <div
        className={
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 transition duration-300 " +
          (visible ? "opacity-100" : "opacity-0")
        }>
        <Bouncy size="45" speed="1" color="black" />
      </div>
    </div>
  );
}
