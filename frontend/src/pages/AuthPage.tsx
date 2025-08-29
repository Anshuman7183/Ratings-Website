import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState<"USER" | "OWNER">("USER"); // keep ADMIN out of the UI
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        // address is required by your backend; role can be USER or OWNER from UI
        await register(name, email, password, address, role);
      }
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow p-6 rounded-lg w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {mode === "login" ? "Login" : "Register"}
        </h1>

        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <input
                type="text"
                placeholder="Name"
                className="w-full border p-2 rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Address"
                className="w-full border p-2 rounded"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <div className="text-sm">
                <label className="block mb-1">Role</label>
                <select
                  className="w-full border p-2 rounded"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "USER" | "OWNER")}
                >
                  <option value="USER">Normal User</option>
                  <option value="OWNER">Store Owner</option>
                </select>
                <p className="mt-1 text-gray-500">
                  Admin role isn’t selectable here (challenge requirement). An admin can be created manually if needed.
                </p>
              </div>
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Please wait…" : mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        <div className="text-center mt-4">
          {mode === "login" ? (
            <p>
              Don’t have an account?{" "}
              <button type="button" className="text-blue-600 underline" onClick={() => setMode("register")}>
                Register
              </button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button type="button" className="text-blue-600 underline" onClick={() => setMode("login")}>
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
