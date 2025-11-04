import { useState } from "react";
import Hero from "../components/organisms/hero";

function HomePage() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Hero />
    </>
  );
}

export default HomePage;
