import RegistrationForm from "../RegistrationForm";

export default function RegistrationFormExample() {
  return (
    <div className="py-12 bg-background">
      <RegistrationForm onSuccess={() => console.log("Registration success")} />
    </div>
  );
}
