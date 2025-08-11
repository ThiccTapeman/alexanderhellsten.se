/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

import ContactCard from "@/components/ContactCard";
import { Mail, Phone, MapPinned } from "lucide-react";

export default function ContactCards() {
  return (
    <section className="bg-white w-full p-4 text-black">
      <div className="container mx-auto flex flex-col md:flex-row gap-10 mt-10 mb-10 md:mb-20 md:mt-20">
        <ContactCard
          href="mailto:alexanderhellsten7@gmail.com"
          title={"Email"}
          value="alexanderhellsten7@gmail.com"
          description={"Email me anytime"}>
          <Mail size={20}></Mail>
        </ContactCard>
        <ContactCard
          copy
          text="0704735886"
          title={"Phone"}
          value="+46 070 473 58 86"
          description="Call me during buisness hours">
          <Phone size={20}></Phone>
        </ContactCard>
        <ContactCard
          title={"Location"}
          value="Sodermanland, Sweden"
          href="https://www.google.com/maps/place/Södermanland+County/@59.0072016,16.3283747,8z/data=!4m6!3m5!1s0x465ed834436269a7:0x300fef341e48af0!8m2!3d59.0336349!4d16.7518899!16zL20vMHp3YnY?entry=ttu&g_ep=EgoyMDI1MDgwNS4wIKXMDSoASAFQAw%3D%3D"
          target="_blank"
          rel="noopener noreferrer"
          description="Aviable for local meetings">
          <MapPinned size={20}></MapPinned>
        </ContactCard>
      </div>
    </section>
  );
}
