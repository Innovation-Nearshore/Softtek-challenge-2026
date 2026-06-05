import { Outlet } from 'react-router-dom'
import NavigationHeader from '../organisms/NavigationHeader'

/**
 * Template: MainLayout
 * Wraps the application with the navigation header and main content area.
 */
const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
