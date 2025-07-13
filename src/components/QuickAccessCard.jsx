export default function QuickAccessCard({ title, subtitle, icon, onClick }) {
  return (
    <div
      className="p-4 rounded-2xl shadow backdrop-blur-md bg-white/40 border border-white/30 flex flex-col items-start min-h-[100px] min-w-[120px] cursor-pointer"
      onClick={onClick}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <h4 className="font-semibold">{title}</h4>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  );
}
  