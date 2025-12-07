"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        question: "Who can participate?",
        answer: "Anyone! Whether you're a student, professional, or just getting started, DevForge is open to all skill levels. We encourage diverse teams with different backgrounds.",
    },
    {
        question: "Do I need a team?",
        answer: "You can participate solo or in teams of up to 4 people. Don't have a team? No worries! We'll have a team formation session at the start of the event.",
    },
    {
        question: "How much does it cost?",
        answer: "Nothing! DevForge is completely free. We provide food, swag, and a place to hack. You just need to bring your laptop and charger.",
    },
    {
        question: "What should I build?",
        answer: "Anything you want! We have several tracks including AI/ML, Web3, Social Good, and Best Beginner Hack. We encourage creativity and trying new things.",
    },
    {
        question: "Will there be prizes?",
        answer: "Yes! We have several swags and API credits in store for prizes.",
    },
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-24 bg-black">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-12">
                    Frequently Asked <span className="text-orange-500">questions</span>
                </h2>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border border-white/10 rounded-xl bg-white/5 overflow-hidden transition-all hover:border-white/20"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left"
                            >
                                <span className="text-lg font-medium text-white">{faq.question}</span>
                                <ChevronDown
                                    className={`w-5 h-5 text-neutral-400 transition-transform ${openIndex === index ? "rotate-180" : ""}`}
                                />
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-6 pb-6 text-neutral-400">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
