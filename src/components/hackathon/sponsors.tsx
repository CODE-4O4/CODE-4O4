"use client";

import { motion } from "framer-motion";

export function Sponsors() {
    return (
        <section className="py-24 bg-black border-y border-white/5 relative overflow-hidden">
            {}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
                <h2 className="text-2xl font-bold text-neutral-500 mb-12 uppercase tracking-widest">Sponsored By</h2>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                    {}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="relative w-48 h-24 md:w-64 md:h-32 bg-white rounded-xl p-4 flex items-center justify-center"
                    >
                        <img
                            src="/mlh.png"
                            alt="Major League Hacking"
                            className="object-contain w-full h-full"
                        />
                    </motion.div>

                    {}
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-4xl font-bold text-neutral-600"
                    >
                        X
                    </motion.div>

                    {}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="relative w-48 h-24 md:w-64 md:h-32 bg-white rounded-xl p-4 flex items-center justify-center overflow-hidden"
                    >
                        <img
                            src="/gemini.webp"
                            alt="Google Gemini"
                            className="object-contain w-full h-full scale-110"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
