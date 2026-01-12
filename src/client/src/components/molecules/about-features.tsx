import { IonIcon } from "@ionic/react";
import {
    calendarOutline,
    peopleOutline,
    shieldCheckmarkOutline,
} from "ionicons/icons";

const features = [
    {
        icon: calendarOutline,
        title: "Shared Calendars",
        description:
            "One unified calendar visible to all family members. No more double bookings or missed appointments.",
    },
    {
        icon: peopleOutline,
        title: "Flexible Family Groups",
        description:
            "Create circles for co-parents, grandparents, babysitters, and anyone who helps care for your children.",
    },
    {
        icon: shieldCheckmarkOutline,
        title: "Privacy Controls",
        description:
            "You decide who sees what. Share only the information that's relevant to each family member.",
    }
];

export function AboutFeatures() {
    return (
        <section className="py-20 sm:py-28 bg-secondary">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <p className="text-sm font-medium uppercase tracking-widest text-primary mb-4">
                        What We Offer
                    </p>
                    <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground leading-tight text-balance">
                        Everything you need to keep your family{" "}
                        <em className="italic">in sync</em>
                    </h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="bg-card rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-6">
                                <IonIcon
                                    icon={feature.icon}
                                    className="h-6 w-6 text-primary"
                                />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
