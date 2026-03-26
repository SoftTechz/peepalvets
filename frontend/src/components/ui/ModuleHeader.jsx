export default function ModuleHeader({ icon, title, tagline, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
      <div className="flex items-start gap-3">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-purple-100 text-purple-700">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">{tagline}</p>
        </div>
      </div>
      {action ? <div className="w-full sm:w-auto">{action}</div> : null}
    </div>
  );
}
