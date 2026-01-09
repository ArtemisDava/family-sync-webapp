export default function Hero() {
  return (
    <section className="bg-logo text-black py-20 h-[80vh] flex items-center">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Keep your family in sync — without the stress.{" "}
        </h1>
        <p className="text-lg md:text-2xl mb-8">
          Family Sync brings all your family’s schedules, reminders, and
          expenses together in one place. Share what matters, keep the rest
          private, and take back control of your busy life.{" "}
        </p>
        <a
          href="#get-started"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300"
        >
          Get Started
        </a>
      </div>
    </section>
  );
}
