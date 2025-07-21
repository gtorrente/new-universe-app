import { NavLink } from 'react-router-dom'
import { FaStar, FaHome, FaBook, FaUser } from 'react-icons/fa'
import { TbChefHat } from 'react-icons/tb'

const navItem = (path, icon, label) => (
  <NavLink to={path} className={({ isActive }) =>
    `flex flex-col items-center text-xs ${isActive ? 'text-purple-600' : 'text-gray-400'}`
  }>
    {icon}
    <span>{label}</span>
  </NavLink>
)

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex justify-around items-center shadow-md z-50">
      {navItem('/', <FaHome className="text-lg" />, 'Início')}
      {navItem('/mapa-astral', <FaStar className="text-lg" />, 'Astros')}
      {navItem('/receitas', <TbChefHat className="text-lg" />, 'Receitas')}
      {navItem('/diario', <FaBook className="text-lg" />, 'Diário')}
      {navItem('/perfil', <FaUser className="text-lg" />, 'Perfil')}
    </nav>
  )
}
