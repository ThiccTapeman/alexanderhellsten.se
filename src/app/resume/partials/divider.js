export default function Divider({ height = 8, color = "bg-black" }) {
    return <section className={"w-full" + " " + color} style={{ height: height }}></section>
}