import ContactForm from "@/components/ContactForm";
import SocialButtons from "@/components/SocialButtons";
import { cookies } from "next/headers";

export default function Contact() {
  return (
    <section className="p-4 w-full bg-black">
      <div className="container mx-auto">
        <div className="flex w-full gap-20 mt-10 mb-10 flex-col lg:flex-row">
          <div className="w-full">
            <h2 className="text-4xl font-bold mb-3">Send Me A Message</h2>
            <p className="text-gray-300">
              Fill out the form below and I'll get back to you as soon as
              possible. I'm excited to learn about your project and discuss how
              we can work together.
            </p>
            <ContactForm debug></ContactForm>
          </div>
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-4">Other ways to connect</h2>
            <div className="w-full rounded-lg bg-zinc-900 p-15 border border-zinc-800 text-base px-5 mb-15">
              <ul className="list-disc pl-5">
                <li className="mb-1">Aviable for freelance projects</li>
                <li className="mb-1">Open for full-time opportunities</li>
                <li className="mb-1">Happy to discuss collaborations</li>
              </ul>
              <ul className="list-disc pl-5 mt-10">
                <li className="mb-1">Email: Within 24 hours</li>
                <li className="mb-1">
                  Phone: Buisness hours{" "}
                  <span className="text-xs text-gray-300">(9AM - 6PM CET)</span>
                </li>
                <li className="mb-1">Social media: Within 48 hours</li>
              </ul>
            </div>
            <h2 className="text-xl font-bold">Follow Me</h2>
            <SocialButtons additionalClasses={"justify-start"}></SocialButtons>
          </div>
        </div>
      </div>
    </section>
  );
}
