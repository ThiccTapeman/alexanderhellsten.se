/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

import ActionButton from "@/components/ActionButton";
import { Download, Mail } from "lucide-react";

export default function Contact() {
  return (
    <section className="p-4 bg-black">
      <div className="container mx-auto mt-10 mb-15 text-center">
        <h2 className="text-white mb-5 text-3xl md:text-5xl font-bold text-center">
          Ready to work together?
        </h2>
        <p className="text-xl md:w-1/2 mx-auto text-wrap">
          I&apos;m always interested in new opportunities and exciting projects.
          Let&apos;s discuss how we can bring your ideas to life.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center mt-15">
          <ActionButton href={"/contact"} w="w-full md:w-max justify-center">
            <Mail size={15} />
            Get In Touch
          </ActionButton>
          <ActionButton
            href={"/_Alexander_Hellsten_Resume.pdf"}
            secondary
            w="w-full md:w-max justify-center">
            <Download size={15} />
            Download Resumé
          </ActionButton>
        </div>
      </div>
    </section>
  );
}
