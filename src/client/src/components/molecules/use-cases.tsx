import { useState } from "react"
import { IonIcon } from "@ionic/react"
import { chevronDownOutline } from "ionicons/icons"

const useCases = [
    {
        title: "Co-Parenting Coordination",
        description:
            "When parents live in separate homes, FamilySync ensures both stay informed about school events, medical appointments, extracurricular activities, and custody schedules. Reduce miscommunication and keep the focus on your children's wellbeing.",
    },
    {
        title: "Extended Family Involvement",
        description:
            "Grandparents, aunts, uncles, and close family friends can stay connected with the children's lives. Share photos from events, coordinate visits, and make sure everyone knows when important moments are happening.",
    },
    {
        title: "Medical & Health Tracking",
        description:
            "Keep track of dentist appointments, vaccinations, doctor visits, and medication schedules. All caregivers have access to important health information, ensuring consistent care no matter who's on duty.",
    },
    {
        title: "School & Activities",
        description:
            "From parent-teacher conferences to soccer games, never miss an important school event or extracurricular activity. Coordinate transportation, volunteer duties, and homework help seamlessly.",
    },
    {
        title: "Holiday Planning",
        description:
            "Plan family gatherings, coordinate gift lists, and manage holiday schedules across multiple households. Make special occasions stress-free for everyone involved.",
    },
]

export function AboutUseCases() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <section className="py-20 sm:py-28 bg-card">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-widest text-primary mb-4">Use Cases</p>
                        <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground leading-tight text-balance">
                            How families use <em className="italic">FamilySync</em>
                        </h2>
                        <p className="mt-6 text-muted-foreground leading-relaxed">
                            Every family is unique, but the need for clear communication is universal. Here are some of the ways our
                            members use FamilySync to stay connected.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {useCases.map((useCase, index) => (
                            <div key={useCase.title} className="border-b border-border">
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="flex w-full items-center justify-between py-5 text-left"
                                    aria-expanded={openIndex === index}
                                >
                                    <span className="text-lg font-medium text-foreground">{useCase.title}</span>
                                    <IonIcon icon={chevronDownOutline}
                                        className={"h-5 w-5 text-muted-foreground transition-transform duration-200 " + (openIndex === index ? "rotate-180" : "")}
                                    />
                                </button>
                                <div
                                    className={"overflow-hidden transition-all duration-300 " + (openIndex === index ? "max-h-48 pb-5" : "max-h-0")}
                                >
                                    <p className="text-muted-foreground leading-relaxed pr-8">{useCase.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
