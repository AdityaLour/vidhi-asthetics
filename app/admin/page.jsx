import { getCurrentUser } from "@/lib/session";

export default async function AdminPage() {
  const user = await getCurrentUser();

  console.log(user);

  return <pre>{JSON.stringify(user, null, 2)}</pre>;
}
