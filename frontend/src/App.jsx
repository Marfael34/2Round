import { Outlet } from 'react-router-dom'
import NavBar from './components/UI/NavBar'

const App = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <NavBar />
      <main className="flex-1 w-full text-white bg-black">
      <Outlet />
    </main>
    </div>
    
  )
}

export default App