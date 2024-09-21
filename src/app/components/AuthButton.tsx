import { auth, signIn, signOut } from "@/auth";
import { Button } from "./Button";

export function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github", { redirect: true, redirectTo: "/" });
      }}
    >
      <Button>Sign In</Button>
    </form>
  );
}

export function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <Button>Sign Out</Button>
    </form>
  );
}

export async function AuthButton() {
  const session = await auth();
  return !session?.user ? <SignIn /> : <SignOut />;
}
