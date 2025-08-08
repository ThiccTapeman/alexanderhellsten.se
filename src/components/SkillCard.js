export function SkillCard({ title, skills }) {
  return (
    <div className="p-0 md:p-5 md:px-10 w-full shadow-lg">
      <h3 className="text-white text-3xl font-bold mb-1 text-center">
        {title}
      </h3>
      <p className="text-center text-gray-400">{skills}</p>
    </div>
  );
}
