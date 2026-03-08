import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-mark" />
          <h1>Ultra Commerce</h1>
          <p>Sign in to your admin panel</p>
        </div>

        {params.error && (
          <div className="login-error">Invalid email or password.</div>
        )}

        <form action={login} className="login-form">
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@ultra.local"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn-primary btn-block">Sign in</button>
        </form>
      </div>
    </div>
  );
}
