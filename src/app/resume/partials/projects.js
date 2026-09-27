import ProjectList from "@/app/projects/partials/projectList";


export default function Projects({ showLinks = true }) {
    return <section className="p-4 bg-white">
        <div className="container mx-auto mb-10 p-4">
            <h2 className="text-black text-3xl md:text-4xl font-bold text-center mb-10">Projects</h2>
            <ProjectList showFilters={false} maxView={2} showLinks={showLinks} showDescription={true}></ProjectList>
        </div>
    </section>
}