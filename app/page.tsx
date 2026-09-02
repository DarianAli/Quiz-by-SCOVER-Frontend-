// Routing for "/" is handled entirely by proxy.ts middleware.
// Unauthenticated → /login  |  ADMIN → /admin/dashboard  |  etc.
export default function Home() {
  return null;
}
