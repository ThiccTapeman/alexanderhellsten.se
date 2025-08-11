/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

export function InfoCard({ value, label, color, textColor, size }) {
  return (
    <div
      className={`${size} aspect-square absolute rounded-full shadow-lg flex flex-col items-center justify-center ${color} ${textColor}`}>
      <p className="text-3xl">{value}</p>
      <p className="text-base">{label}</p>
    </div>
  );
}
