import { Award, Users, Factory, Truck, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { whyChooseUs } from "@/data/content";

const stats = [
  { label: "Businesses Served", value: "10,000+" },
  { label: "Orders Fulfilled", value: "250,000+" },
  { label: "Print Partners Nationwide", value: "40+" },
  { label: "Average Rating", value: "4.8 / 5" },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Quality First",
    description: "Every order is quality-checked before it leaves our facilities — no exceptions.",
  },
  {
    icon: Heart,
    title: "Customer Obsessed",
    description: "We build long-term relationships by being responsive, honest and easy to work with.",
  },
  {
    icon: Sparkles,
    title: "Continuous Improvement",
    description: "We invest in better materials, equipment and processes every year.",
  },
];

const milestones = [
  { year: "2016", title: "Founded", description: "Started as a small print shop serving local businesses in Bengaluru." },
  { year: "2019", title: "Online Platform Launched", description: "Brought our catalog online, enabling custom orders nationwide." },
  { year: "2022", title: "Print Partner Network", description: "Expanded to a network of quality-checked print partners across India." },
  { year: "2025", title: "10,000+ Businesses", description: "Crossed 10,000 business customers with same-week turnaround on most products." },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl container-px py-16 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl lg:text-5xl">
              Premium printing, built on trust
            </h1>
            <p className="mt-4 text-base leading-relaxed text-text-muted lg:text-lg">
              Priinteve helps businesses of every size bring their brand to life — from business
              cards and marketing materials to packaging and large-format banners — with
              consistent quality, transparent pricing and dependable delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl container-px py-14">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-text sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-sm text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-7xl container-px py-4">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">Our Story</h2>
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              Priinteve began with a simple idea: ordering custom prints shouldn&apos;t mean
              compromising on quality, clarity of pricing, or reliability. What started as a
              single print shop has grown into a nationwide platform connecting businesses with a
              network of quality-checked print partners.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              Today, we produce everything from business cards and brochures to packaging and
              bulk marketing materials — combining professional-grade equipment with an online
              ordering experience designed for speed, transparency and peace of mind.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface p-6 text-center">
              <Factory className="size-6 text-primary" />
              <p className="text-sm font-semibold text-text">Modern Equipment</p>
              <p className="text-xs text-text-muted">Offset & digital presses for every job size</p>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface p-6 text-center">
              <Users className="size-6 text-primary" />
              <p className="text-sm font-semibold text-text">Expert Team</p>
              <p className="text-xs text-text-muted">Print specialists guiding every order</p>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface p-6 text-center">
              <Truck className="size-6 text-primary" />
              <p className="text-sm font-semibold text-text">Pan-India Delivery</p>
              <p className="text-xs text-text-muted">Tracked shipping to every pincode</p>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface p-6 text-center">
              <Award className="size-6 text-primary" />
              <p className="text-sm font-semibold text-text">ISO 9001 Certified</p>
              <p className="text-xs text-text-muted">Consistent quality management standards</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl container-px py-14">
        <h2 className="text-center text-2xl font-bold tracking-tight text-text sm:text-3xl">What We Stand For</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {values.map((value) => (
            <div key={value.title} className="rounded-lg border border-border p-6 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <value.icon className="size-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-text">{value.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why choose us (reuse content) */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl container-px py-14">
          <h2 className="text-center text-2xl font-bold tracking-tight text-text sm:text-3xl">Why Businesses Choose Priinteve</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item) => (
              <div key={item.title} className="rounded-lg border border-border bg-background p-6">
                <h3 className="text-sm font-semibold text-text">{item.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="mx-auto max-w-7xl container-px py-14">
        <h2 className="text-center text-2xl font-bold tracking-tight text-text sm:text-3xl">Our Journey</h2>
        <div className="mx-auto mt-10 max-w-2xl">
          <ol className="flex flex-col gap-8 border-l border-border pl-6">
            {milestones.map((milestone) => (
              <li key={milestone.year} className="relative">
                <span className="absolute -left-[31px] flex size-4 items-center justify-center rounded-full border-2 border-primary bg-background" />
                <p className="text-sm font-bold text-primary">{milestone.year}</p>
                <h3 className="mt-1 text-base font-semibold text-text">{milestone.title}</h3>
                <p className="mt-1 text-sm text-text-muted">{milestone.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
