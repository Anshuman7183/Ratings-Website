import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  listStores,
  createStore,
  topStores,
  rateStore,
  ownerMineRatings,
  adminStats,
  adminListUsers,
  adminCreateUser,
  changePassword,
  api,
} from "../api/client";

export default function Dashboard() {
  const { user, logout } = useAuth();

  // stores + top
  const [stores, setStores] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"name" | "address" | "avgRating">("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);

  const [top, setTop] = useState<any[]>([]);
  const [topLimit, setTopLimit] = useState(5);

  // create store
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // change password
  const [pwCur, setPwCur] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  // owner/admin panels
  const [ownerRows, setOwnerRows] = useState<any[]>([]);
  const [admStats, setAdmStats] = useState<any>({});
  const [admUsers, setAdmUsers] = useState<any[]>([]);
  const [admQ, setAdmQ] = useState("");
  const [admRole, setAdmRole] = useState("");
  const [admForm, setAdmForm] = useState({ name: "", email: "", address: "", password: "", role: "USER" });

  useEffect(() => {
    if (!user) return;
    refreshLists();
    // owner/admin one-time fetch
    if (user.role === "OWNER" || user.role === "ADMIN") loadOwner();
    if (user.role === "ADMIN") loadAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page, limit, q, sort, order, topLimit]);

  async function refreshLists() {
    setLoading(true);
    try {
      const [storesRes, topRes] = await Promise.all([
        listStores({ page, limit, q, sort, order }),
        topStores(topLimit),
      ]);
      setStores(storesRes?.data ?? []);
      setTop(topRes ?? []);
    } catch (e) {
      // ignore; usually auth/network
    } finally {
      setLoading(false);
    }
  }

  async function onCreateStore(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      await createStore({ name, address });
      setName("");
      setAddress("");
      await refreshLists();
    } catch (err: any) {
      setError(err.message || "Failed to create store");
    } finally {
      setCreating(false);
    }
  }

  async function onRate(storeId: number, value: number) {
    await rateStore(storeId, value);
    await refreshLists();
    if (user?.role === "OWNER" || user?.role === "ADMIN") loadOwner();
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    try {
      await changePassword({ currentPassword: pwCur, newPassword: pwNew });
      setPwCur(""); setPwNew("");
      setPwMsg("Password updated.");
    } catch (e: any) {
      setPwMsg(e.message || "Failed to change password");
    }
  }

  async function loadOwner() {
    try {
      const rows = await ownerMineRatings();
      setOwnerRows(rows);
    } catch {}
  }

  async function loadAdmin() {
    try {
      const [s, u] = await Promise.all([adminStats(), adminListUsers({ q: admQ, role: admRole })]);
      setAdmStats(s);
      setAdmUsers(u);
    } catch {}
  }

  if (!user) return null; // ProtectedRoute already redirects if not logged in

  return (
    <div className="p-6 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Roxiler Demo</h1>
          <p className="text-sm text-gray-600">
            Logged in as <span className="font-medium">{user.name || user.email}</span> ({user.role})
          </p>
        </div>
        <button onClick={logout} className="px-3 py-2 rounded bg-black text-white">
          Logout
        </button>
      </header>

      {/* Change password */}
      <section className="border rounded p-4">
        <h2 className="text-lg font-semibold mb-2">Change Password</h2>
        {pwMsg && <p className="text-sm mb-2">{pwMsg}</p>}
        <form onSubmit={onChangePassword} className="flex flex-wrap gap-2 items-center">
          <input
            type="password"
            className="border p-2 rounded"
            placeholder="Current password"
            value={pwCur}
            onChange={(e) => setPwCur(e.target.value)}
            required
          />
          <input
            type="password"
            className="border p-2 rounded"
            placeholder="New password (8–16, 1 uppercase, 1 special)"
            value={pwNew}
            onChange={(e) => setPwNew(e.target.value)}
            required
          />
          <button className="px-3 py-2 border rounded">Update</button>
        </form>
      </section>

      {/* Create Store (visible to OWNER/ADMIN only; backend will also enforce) */}
      {(user.role === "OWNER" || user.role === "ADMIN") && (
        <section className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Create Store</h2>
          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          <form onSubmit={onCreateStore} className="flex flex-wrap gap-2 items-center">
            <input
              className="border p-2 rounded"
              placeholder="Store name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="border p-2 rounded"
              placeholder="Store address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <button className="px-3 py-2 rounded bg-black text-white disabled:opacity-50" disabled={creating}>
              {creating ? "Saving…" : "Add"}
            </button>
          </form>
        </section>
      )}

      {/* Stores list */}
      <section className="border rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Stores</h2>
          <div className="flex flex-wrap gap-2">
            <input
              className="border p-2 rounded"
              placeholder="Search name/address"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select className="border p-2 rounded" value={sort} onChange={(e) => setSort(e.target.value as any)}>
              <option value="name">Name</option>
              <option value="address">Address</option>
              <option value="avgRating">Avg Rating</option>
            </select>
            <select className="border p-2 rounded" value={order} onChange={(e) => setOrder(e.target.value as any)}>
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
            <select className="border p-2 rounded" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
              {[5, 10, 15].map((n) => (
                <option key={n} value={n}>{n}/page</option>
              ))}
            </select>
            <button className="px-3 py-2 border rounded" onClick={() => setPage(1)}>
              Apply
            </button>
          </div>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : stores.length ? (
          <ul className="space-y-2">
            {stores.map((s: any) => (
              <li key={s.id} className="border rounded p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-sm text-gray-600">{s.address}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Avg: <b>{Number(s.avgRating ?? 0).toFixed(2)}</b></span>
                  <span>Your: <b>{s.userRating ?? "-"}</b></span>
                  <RateControl storeId={s.id} userRating={s.userRating} onSave={onRate} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No stores yet.</p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} className="px-3 py-1 border rounded">Prev</button>
          <span>Page {page}</span>
          <button onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded">Next</button>
          <button onClick={() => refreshLists()} className="px-3 py-1 border rounded">Refresh</button>
        </div>
      </section>

      {/* Top stores */}
      <section className="border rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Top Stores by Rating</h2>
          <div className="flex items-center gap-2">
            <select className="border p-2 rounded" value={topLimit} onChange={(e) => setTopLimit(Number(e.target.value))}>
              {[5, 10, 15].map((n) => (
                <option key={n} value={n}>Top {n}</option>
              ))}
            </select>
            <button className="px-3 py-2 border rounded" onClick={() => setTopLimit(topLimit)}>
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : top.length ? (
          <ol className="list-decimal pl-5">
            {top.map((t: any, i: number) => (
              <li key={i}>
                {t.name || `Store ${t.storeId}`} — {Number(t.avgRating ?? t.average ?? t._avg?.score ?? 0).toFixed(2)}
              </li>
            ))}
          </ol>
        ) : (
          <p>No data.</p>
        )}
      </section>

      {/* OWNER panel */}
      {(user.role === "OWNER" || user.role === "ADMIN") && (
        <section className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">My Stores – Raters</h2>
          {ownerRows.length ? ownerRows.map((s: any) => (
            <div key={s.storeId} className="mb-3">
              <div className="font-medium">{s.storeName} (avg {Number(s.average ?? 0).toFixed(2)})</div>
              <ul className="list-disc pl-5">
                {s.raters.map((r: any) => (
                  <li key={r.userId}>{r.name} ({r.email}) — {r.value}</li>
                ))}
              </ul>
            </div>
          )) : <p>No ratings yet.</p>}
        </section>
      )}

      {/* ADMIN panel */}
      {user.role === "ADMIN" && (
        <section className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Admin</h2>
          <div className="mb-4">Users: {admStats.users ?? 0} • Stores: {admStats.stores ?? 0} • Ratings: {admStats.ratings ?? 0}</div>

          <form
            className="mb-4 flex flex-wrap gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              await adminCreateUser(admForm);
              setAdmForm({ name: "", email: "", address: "", password: "", role: "USER" });
              loadAdmin();
            }}
          >
            <input className="border p-2 rounded" placeholder="Name" value={admForm.name} onChange={(e) => setAdmForm({ ...admForm, name: e.target.value })} required />
            <input className="border p-2 rounded" placeholder="Email" value={admForm.email} onChange={(e) => setAdmForm({ ...admForm, email: e.target.value })} required />
            <input className="border p-2 rounded" placeholder="Address" value={admForm.address} onChange={(e) => setAdmForm({ ...admForm, address: e.target.value })} required />
            <input className="border p-2 rounded" type="password" placeholder="Password" value={admForm.password} onChange={(e) => setAdmForm({ ...admForm, password: e.target.value })} required />
            <select className="border p-2 rounded" value={admForm.role} onChange={(e) => setAdmForm({ ...admForm, role: e.target.value })}>
              <option value="USER">USER</option>
              <option value="OWNER">OWNER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <button className="px-3 py-2 rounded bg-black text-white">Add User</button>
          </form>

          <div className="flex flex-wrap gap-2 mb-3">
            <input className="border p-2 rounded" placeholder="Search users…" value={admQ} onChange={(e) => setAdmQ(e.target.value)} />
            <select className="border p-2 rounded" value={admRole} onChange={(e) => setAdmRole(e.target.value)}>
              <option value="">All</option>
              <option value="USER">USER</option>
              <option value="OWNER">OWNER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <button className="px-3 py-2 border rounded" onClick={loadAdmin}>Filter</button>
          </div>

          <ul className="list-disc pl-5">
            {admUsers.map((u) => (
              <li key={u.id}>
                {u.name} — {u.email} — {u.address} — {u.role}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/** Small inline control to submit/modify rating (1..5). */
function RateControl({
  storeId,
  userRating,
  onSave,
}: {
  storeId: number;
  userRating: number | null;
  onSave: (id: number, value: number) => Promise<void>;
}) {
  const [val, setVal] = useState(userRating ?? 0);
  const [saving, setSaving] = useState(false);
  return (
    <span className="inline-flex items-center gap-2">
      <select className="border p-1 rounded" value={val} onChange={(e) => setVal(Number(e.target.value))}>
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <button
        disabled={saving || val === 0}
        onClick={async () => {
          setSaving(true);
          await onSave(storeId, val);
          setSaving(false);
        }}
        className="px-2 py-1 border rounded"
      >
        {userRating ? "Update" : "Submit"}
      </button>
    </span>
  );
}
