import LoginForm from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";

export default function Home() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Login</h2>
          <LoginForm />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
