import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";
import { useUser } from "../../contexts/user.context";

export default function Hero() {
  const { user } = useUser();

  return (
    <section className="bg-logo text-black py-8 sm:py-2 lg:py-4 h-[80vh] flex items-center px-4 lg:px-0 max-w-6xl mx-auto">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Keep your family in sync — without the stress.{" "}
        </h1>
        <p className="text-lg md:text-2xl mb-8">
          Family-Sync brings all your family's schedules, reminders, and
          expenses together in one place. Share what matters, keep the rest
          private, and take back control of your busy life.{" "}
        </p>
        <Button
          variant="contained"
          size="small"
          color="secondary"
          component={RouterLink}
          to={user ? "/schedules" : "/signup"}
          sx={{
            px: 6,
            py: 2,
            textTransform: "none",
            fontWeight: "bold",
            fontSize: "15px",
            borderRadius: "16px",
          }}
        >
          Get Started
        </Button>
      </div>
    </section>
  );
}
