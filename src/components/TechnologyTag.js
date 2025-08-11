/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

export default function TechnologyTag({ item }) {
  return (
    <div
      className={
        "p-3 w-max rounded-full text-black text-xs " +
        (item.color || "") +
        " " +
        (item.text || "")
      }>
      {item.title}
    </div>
  );
}
