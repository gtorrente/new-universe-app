export default function HoroscopeCard({ sign, message }) {
    return (
        <div className="w-full rounded-2xl p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow">
        <h2 className="text-lg font-bold">Horóscopo do Dia</h2>
        <p className="text-sm opacity-90">{sign}</p>
        <p className="mt-2 text-sm">{message}</p>
      </div>
    )
  }
  