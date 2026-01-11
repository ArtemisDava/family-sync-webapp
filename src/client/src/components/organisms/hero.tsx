import Button from "@mui/material/Button";

export default function Hero() {
  return (
    <section className="bg-logo text-black py-20 h-[80vh] flex items-center max-w-[72rem] mx-auto">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Keep your family in sync — without the stress.{" "}
        </h1>
        <p className="text-lg md:text-2xl mb-8">
          Family-Sync brings all your family’s schedules, reminders, and
          expenses together in one place. Share what matters, keep the rest
          private, and take back control of your busy life.{" "}
        </p>
        <Button
          variant="contained"
          size="small"
          color="secondary"
          type="submit"
          fullWidth={false}
          sx={{
            px: 4,
            py: 2,
            textTransform: "none",
            fontSize: "1rem",
          }}
        >
          Get Started
        </Button>
      </div>
    </section>
  );
}
