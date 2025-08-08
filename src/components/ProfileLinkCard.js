import DelayedLink from "./DelayedLink";

export function ProfileLinkCard({
  title,
  description,
  icon: Icon,
  href,
  className,
}) {
  return (
    <DelayedLink
      href={href}
      className={`group w-full p-10 px-12 border border-black rounded-xl hover:bg-black cursor-pointer transition duration-200 ${
        className || ""
      }`}>
      <h2 className="text-3xl font-semibold text-black mb-2 w-max flex gap-3 items-center group-hover:text-white transition duration-200">
        <Icon
          size={30}
          className="text-black group-hover:text-white transition duration-50"
        />
        {title}
      </h2>
      <p className="text-black w-full group-hover:text-white transition duration-200">
        {description}
      </p>
    </DelayedLink>
  );
}
