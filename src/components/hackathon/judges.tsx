"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Linkedin } from "lucide-react";

const judges = [
    {
        name: "Samaresh Singh",
        title: "Principal Engineer",
        company: "HP",
        location: "Austin, Texas, United States",
        image: "/samaresh-singh.png",
        linkedin: "https://www.linkedin.com/in/samaresh-singh-9772ba23/",
        expertise: "Edge Computing | Cloud Engineering | IoT/IIoT | Distributed Systems | Security | AI/ML | Deep Learning | LLMs | RAG | GenAI"
    }
];

export function Judges() {
    return (
        <section className="py-24 bg-gradient-to-b from-black via-neutral-950 to-black border-y border-white/5 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Meet Our <span className="text-orange-500">Judges</span>
                    </h2>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
                        Industry experts who will evaluate your innovative solutions
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {judges.map((judge, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]"
                        >
                            {/* Profile Image */}
                            <div className="relative mb-6 mx-auto w-32 h-32">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/10 group-hover:border-orange-500/50 transition-colors duration-300">
                                    <Image
                                        src={judge.image}
                                        alt={judge.name}
                                        width={128}
                                        height={128}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="text-center space-y-3">
                                <h3 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors duration-300">
                                    {judge.name}
                                </h3>
                                
                                <div className="space-y-1">
                                    <p className="text-orange-400 font-semibold">
                                        {judge.title}
                                    </p>
                                    <p className="text-neutral-400 text-sm">
                                        {judge.company}
                                    </p>
                                    <p className="text-neutral-500 text-xs">
                                        {judge.location}
                                    </p>
                                </div>

                                {judge.expertise && (
                                    <p className="text-neutral-400 text-xs leading-relaxed pt-3 border-t border-white/5">
                                        {judge.expertise}
                                    </p>
                                )}

                                {/* LinkedIn Link */}
                                {judge.linkedin && (
                                    <a
                                        href={judge.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/50 rounded-lg text-sm text-neutral-300 hover:text-orange-400 transition-all duration-300"
                                    >
                                        <Linkedin size={16} />
                                        <span>View Profile</span>
                                    </a>
                                )}
                            </div>

                            {/* Corner Accent */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
