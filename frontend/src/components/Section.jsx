export default function Section({ title, right, children }) {
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
