/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */


// Loader with a horizontal "curtain" effect
export default function Loader({ visible }) {
  return (
    <div aria-hidden="true" className="w-screen h-screen fixed left-0 top-0 z-50 flex pointer-events-none">
      <div
        className={
          "w-full h-full md:h-1/2 origin-bottom bg-white z-50 absolute bottom-0 transition-transform duration-300 motion-reduce:transition-none " +
          (visible ? "scale-y-100" : "scale-y-0")
        }></div>
      <div
        className={
          "w-full h-1/2 origin-top bg-white z-50 absolute top-0 transition-transform duration-300 motion-reduce:transition-none hidden md:block " +
          (visible ? "scale-y-100" : "scale-y-0")
        }></div>
      <div
        className={
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 transition duration-300 " +
          (visible ? "opacity-100" : "opacity-0")
        }>
        {visible && <div className="flex gap-1.5">{[0, 1, 2].map((dot) => <span key={dot} className="h-2.5 w-2.5 rounded-full bg-black animate-bounce motion-reduce:animate-none" style={{ animationDelay: `${dot * 100}ms` }} />)}</div>}
      </div>
    </div>
  );
}
