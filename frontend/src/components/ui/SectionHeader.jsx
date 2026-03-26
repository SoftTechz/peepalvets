export default function SectionHeader({ title, icon = null, className = "" }) {
  return (
    <div
      className={`text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-purple-200 ${className}`.trim()}
    >
      <h2 className="inline-flex items-center gap-2">
        <span className="text-purple-700">{icon}</span>
        <span>{title}</span>
      </h2>
    </div>
  );
}
