export default function Input({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      {label && <label className="text-sm text-gray-600">{label}</label>}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
      />
    </div>
  );
}
