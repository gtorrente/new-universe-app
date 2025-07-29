export default function HoroscopeCard({ sign, message }) {
    return (
        <div className="w-full rounded-2xl p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow overflow-visible">
        <h2 className="text-lg font-bold mb-2">Horóscopo do Dia</h2>
        <p className="text-sm opacity-90 mb-3">{sign}</p>
        <div className="text-sm leading-relaxed" style={{ 
          wordWrap: 'break-word', 
          overflowWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          maxHeight: 'none',
          height: 'auto'
        }}>
          {message}
        </div>
      </div>
    )
  }
  