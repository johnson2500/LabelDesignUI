interface TopBarProps {
    onSignOut?: () => void;
    userEmail?: string | null;
}

export default function TopBar({ onSignOut, userEmail }: TopBarProps) {
    return (
        <nav class="bg-gray-800 text-white px-6 py-3 flex justify-between items-center shadow">
            <div class="text-xl font-semibold">AI Image</div>
            <div class="flex items-center space-x-4">
                <a href="/" class="hover:underline text-gray-200">Home</a>
                <a href="/projects" class="hover:underline text-gray-200">Projects</a>
                <a href="/logs" class="hover:underline text-gray-200">Logs</a>
                {onSignOut && (
                    <>
                        {userEmail && (
                            <span class="text-xs text-gray-400 hidden sm:inline">{userEmail}</span>
                        )}
                        <button
                            onClick={onSignOut}
                            class="px-3 py-1 text-xs font-medium bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            Sign out
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}