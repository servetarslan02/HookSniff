"use client";
import { motion } from "motion/react";

const testimonials = [
  { text: "HookSniff transformed how we handle webhooks. Reliable, fast, and incredibly easy to integrate.", image: "https://avatar.vercel.sh/jack", name: "Jack Thompson", role: "CTO at TechFlow" },
  { text: "We switched from building our own webhook system and never looked back. Best decision ever.", image: "https://avatar.vercel.sh/jill", name: "Jill Chen", role: "Lead Engineer at DataSync" },
  { text: "The delivery guarantees and retry logic are top-notch. Our webhook reliability went from 92% to 99.9%.", image: "https://avatar.vercel.sh/john", name: "John Miller", role: "VP Engineering at CloudBase" },
  { text: "Setting up webhooks used to take weeks. With HookSniff, we were live in under an hour.", image: "https://avatar.vercel.sh/sarah", name: "Sarah Kim", role: "Founder at AppWorks" },
  { text: "The real-time analytics dashboard gives us complete visibility into our webhook infrastructure.", image: "https://avatar.vercel.sh/mike", name: "Mike Rivera", role: "DevOps Lead at ScaleUp" },
  { text: "Enterprise-grade security without the enterprise complexity. Exactly what we needed.", image: "https://avatar.vercel.sh/lisa", name: "Lisa Park", role: "Security Engineer at FinTech Pro" },
];

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: typeof testimonials;
  duration?: number;
}) => {
  const items = [...props.testimonials, ...props.testimonials];
  return (
    <div className={props.className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-background"
      >
        {items.map(({ text, image, name, role }, i) => (
          <div className="p-10 rounded-3xl border shadow-lg shadow-primary/10 max-w-xs w-full" key={`${name}-${i}`}>
            <div>{text}</div>
            <div className="flex items-center gap-2 mt-5">
              <img width={40} height={40} src={image} alt={name} className="h-10 w-10 rounded-full" />
              <div className="flex flex-col">
                <div className="font-medium tracking-tight leading-5">{name}</div>
                <div className="leading-5 opacity-60 tracking-tight">{role}</div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

;