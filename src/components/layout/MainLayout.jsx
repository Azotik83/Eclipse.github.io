import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function MainLayout({ children }) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <TopBar />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="animate-fadeIn">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
