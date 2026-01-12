import { AboutFeatures } from "../components/molecules/about-features";
import { AboutUseCases } from "../components/molecules/use-cases";


export default function About() {
  return <>
    <section className="bg-card max-w-6xl mx-auto">
      <div className="mx-auto max-w-7xl ">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-4">Our Mission</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground leading-tight text-balance">
              Bringing families closer, <em className="italic">one event at a time</em>
            </h2>
            <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
              <p>
                FamilySync was born from a simple truth: modern families come in all shapes and sizes, and keeping
                everyone on the same page shouldn't be complicated.
              </p>
              <p>
                Whether you're co-parenting after a divorce, coordinating with grandparents, or just trying to keep
                track of everyone's schedules, we're here to help. We believe that better communication leads to better
                relationships—and happier kids.
              </p>
              <p>
                Our platform creates a shared space where parents, guardians, family members, and trusted friends can
                seamlessly coordinate everything from doctor's appointments to soccer practice, holidays to homework
                help.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-muted">
              <img
                src="/family-hands-together-diverse-ages--warm-lighting.png"
                alt="Diverse family hands joined together"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-48 h-48 rounded-xl overflow-hidden border-4 border-card shadow-lg hidden sm:block">
              <img
                src="/smiling-child-with-calendar--happy-organized-famil.png"
                alt="Happy child with organized schedule"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
    <AboutFeatures />
    <AboutUseCases />
  </>
}