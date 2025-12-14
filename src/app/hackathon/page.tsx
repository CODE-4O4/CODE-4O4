import { Hero } from "@/components/hackathon/hero";
import { Schedule } from "@/components/hackathon/schedule";
import { FAQ } from "@/components/hackathon/faq";
import { Sponsors } from "@/components/hackathon/sponsors";

export default function HackathonPage() {
    return (
        <div className="bg-black text-white selection:bg-orange-500 selection:text-black">
            <Hero />
            <Sponsors />
            <Schedule />
            <FAQ />

            {}
            <footer className="py-8 text-center text-neutral-600 border-t border-white/5 text-sm">
                <p className="text-neutral-500 text-sm">
                    © 2025 DevForge. Built by Dev Club NSTxSVYASA.
                </p>
            </footer>
        </div>
    );
}
