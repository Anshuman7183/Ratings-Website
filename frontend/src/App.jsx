import React, { useEffect, useMemo, useState } from "react";

// Minimal single-file React app to wire with your backend
// Tailwind CSS classes used for quick styling
// Set backend URL via Vite env: VITE_API_URL=http://localhost:4000
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// ---- tiny utils ----
async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg = j.error || j.message || msg;
      if (j.path) msg += ` (${j.path})`;
    } catch {}
    throw new Error(msg);
  }
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

function useLocalStorage(key, initial) {
  const [v, setV] = useState(() => {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : initial;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(v));
  }, [key, v]);
  return [v, setV];
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 border border-gray-200">
      {children}
    </span>
  );
}

function Section({ title, children, right }) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm p-4 lg:p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}

export default function App() {
  const [token, setToken] = useLocalStorage("roxiler_token", "");
  const [me, setMe] = useLocalStorage("roxiler_me", null);
  const [notice, setNotice] = useState("");

  const isAuthed = !!token;

  useEffect(() => {
    const loadMe = async () => {
      if (!token) {
        setMe(null);
        return;
      }
      try {
        const m = await api("/api/me", { token });
        setMe(m);
      } catch (e) {
        setNotice(`Auth error: ${e.message}`);
        setToken("");
        setMe(null);
      }
    };
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Ratings Website</h1>
            <p className="text-sm text-gray-600">
              Connected to <code>{BASE_URL}</code>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {me ? (
              <Badge>
                {me.email} · {me.role ?? "USER"}
              </Badge>
            ) : (
              <Badge>Guest</Badge>
            )}
            {isAuthed && (
              <button
                onClick={() => {
                  setToken("");
                  setMe(null);
                  setNotice("Logged out");
                }}
                className="px-3 py-1.5 rounded-xl border text-sm hover:bg-gray-50"
              >
                Logout
              </button>
            )}
          </div>
        </header>

        {notice && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">
            {notice}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <AuthPanel onLogin={(tok) => { setToken(tok); setNotice("Logged in"); }} />
            <TopStoresPanel />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <StoresPanel me={me} token={token} onError={(m) => setNotice(m)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthPanel({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "India",
    role: "USER",
  });
  const [loading, setLoading] = useState(false);

  const disabled = loading;

  const handleLogin = async () => {
    setLoading(true);
    try {
      const r = await api("/api/auth/login", {
        method: "POST",
        body: { email: form.email, password: form.password },
      });
      onLogin(r.token);
    } catch (e) {
      alert(`Login failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleRegister = async () => {
    setLoading(true);
    try {
      // backend requires: name, email, password (extra fields ignored safely)
      await api("/api/auth/register", { method: "POST", body: form });
      alert("Registered. Please login.");
      setTab("login");
    } catch (e) {
      alert(`Register failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section
      title="Authentication"
      right={
        <div className="inline-flex bg-gray-100 rounded-xl p-1">
          {["login", "register"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                tab === t ? "bg-white border shadow-sm" : ""
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      }
    >
      <div className="space-y-3">
        {tab === "register" && (
          <div className="grid grid-cols-1 gap-3">
            <Input
              label="Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <Input
              label="Address"
              value={form.address}
              onChange={(v) => setForm({ ...form, address: v })}
            />
            <div>
              <label className="text-sm text-gray-600">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              >
                <option value="USER">USER</option>
                <option value="OWNER">OWNER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>
        )}
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
        />

        {tab === "login" ? (
          <button
            disabled={disabled}
            onClick={handleLogin}
            className="w-full mt-2 py-2 rounded-xl bg-black text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        ) : (
          <button
            disabled={disabled}
            onClick={handleRegister}
            className="w-full mt-2 py-2 rounded-xl bg-black text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        )}
      </div>
    </Section>
  );
}

function StoresPanel({ me, token, onError }) {
  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);

  const canCreate = me && (me.role === "OWNER" || me.role === "ADMIN");

  const load = async () => {
    setLoading(true);
    try {
      const r = await api(`/api/stores?page=${page}&limit=${limit}`);
      setStores(r.items || r.data || []);
    } catch (e) {
      onError?.(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); // eslint-disable-next-line
  }, [page]);

  return (
    <Section
      title="Stores"
      right={
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="px-3 py-1.5 rounded-xl border text-sm"
          >
            Refresh
          </button>
          <Badge>{stores.length} shown</Badge>
        </div>
      }
    >
      {canCreate && <CreateStoreForm token={token} onCreated={load} />}

      <div className="mt-4 grid gap-3">
        {loading && (
          <div className="text-sm text-gray-500">Loading stores...</div>
        )}
        {!loading && stores.length === 0 && (
          <div className="text-sm text-gray-500">No stores yet.</div>
        )}
        {stores.map((s) => (
          <StoreCard
            key={s.id}
            store={s}
            token={token}
            onRated={load}
            canRate={!!token}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1.5 rounded-xl border text-sm"
        >
          Prev
        </button>
        <span className="text-sm">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1.5 rounded-xl border text-sm"
        >
          Next
        </button>
      </div>
    </Section>
  );
}

function CreateStoreForm({ token, onCreated }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await api("/api/stores", { method: "POST", token, body: { name, address } });
      setName("");
      setAddress("");
      onCreated?.();
    } catch (e) {
      alert(`Create failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border p-3 bg-gray-50">
      <div className="grid lg:grid-cols-3 gap-3">
        <Input label="Store name" value={name} onChange={setName} />
        <Input label="Address" value={address} onChange={setAddress} />
        <div className="flex items-end">
          <button
            disabled={busy || !name || !address}
            onClick={submit}
            className="w-full py-2 rounded-xl bg-black text-white disabled:opacity-50"
          >
            Add Store
          </button>
        </div>
      </div>
    </div>
  );
}

function StoreCard({ store, token, onRated, canRate }) {
  const [value, setValue] = useState(5);
  const avg = store.avgRating ?? 0;

  const rate = async () => {
    try {
      await api(`/api/ratings/${store.id}`, {
        method: "POST",
        token,
        body: { rating: value }, // backend expects "rating"
      });
      onRated?.();
    } catch (e) {
      alert(`Rate failed: ${e.message}`);
    }
  };

  return (
    <div className="border rounded-xl p-4 bg-white flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{store.name}</div>
          <div className="text-sm text-gray-600">{store.address}</div>
        </div>
        <div className="text-right">
          <div className="text-sm">Avg Rating</div>
          <div className="text-xl font-semibold">{avg.toFixed(2)}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={(e) => setValue(parseInt(e.target.value))}
          className="border rounded-xl px-2 py-1"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <button
          disabled={!canRate}
          onClick={rate}
          className="px-3 py-1.5 rounded-xl border text-sm disabled:opacity-50"
        >
          Rate
        </button>
      </div>
    </div>
  );
}

function TopStoresPanel() {
  const [items, setItems] = useState([]);
  const [limit, setLimit] = useState(5);

  const load = async () => {
    try {
      // No /stores/top route in backend minimal version → use /stores?limit=...
      const r = await api(`/api/stores?limit=${limit}`);
      setItems(r.items || []);
    } catch (e) {
      alert(`Top fetch failed: ${e.message}`);
    }
  };
  useEffect(() => {
    load(); // eslint-disable-next-line
  }, [limit]);

  return (
    <Section title="Top Stores by Rating" right={<Badge>limit {limit}</Badge>}>
      <div className="flex items-center gap-2 mb-3">
        <select
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value))}
          className="border rounded-xl px-2 py-1"
        >
          {[5, 10, 15, 20].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <button onClick={load} className="px-3 py-1.5 rounded-xl border text-sm">
          Refresh
        </button>
      </div>
      <div className="space-y-2">
        {items.length === 0 && <div className="text-sm text-gray-500">No data.</div>}
        {items.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between border rounded-xl p-3 bg-white"
          >
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-gray-600">Owner: {s.owner?.name ?? "—"}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Avg</div>
              <div className="text-lg font-semibold">
                {(s.avgRating ?? 0).toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Input({ label, type = "text", value, onChange }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
      />
    </div>
  );
}
