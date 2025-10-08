import Hero from "../Hero";

export default function HeroExample() {
  return <Hero onRegisterClick={() => console.log("Register clicked")} />;
}
