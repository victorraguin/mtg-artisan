import React from "react";

interface DebugAuthProps {
  authData: any;
}

export function DebugAuth({ authData }: DebugAuthProps) {
  const { user, profile, loading, authStable } = authData;
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    setLastUpdate(new Date());
  }, [user, profile, loading, authStable]);

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-xs z-50 border border-gray-600">
      <h3 className="font-bold mb-2 text-yellow-400">🔍 Debug Auth</h3>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Loading:</span>
          <span className={loading ? "text-yellow-400" : "text-green-400"}>
            {loading ? "🔄" : "✅"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Auth Stable:</span>
          <span className={authStable ? "text-green-400" : "text-yellow-400"}>
            {authStable ? "✅" : "🔄"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>User:</span>
          <span className={user ? "text-green-400" : "text-red-400"}>
            {user ? `✅ ${user.email?.substring(0, 15)}...` : "❌"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Profile:</span>
          <span className={profile ? "text-green-400" : "text-red-400"}>
            {profile ? `✅ ${profile.role}` : "❌"}
          </span>
        </div>
        <div className="text-gray-400 text-xs">
          User ID: {user?.id?.substring(0, 8)}...
        </div>
        <div className="text-gray-400 text-xs">
          Profile ID: {profile?.id?.substring(0, 8)}...
        </div>
        <div className="text-gray-500 text-xs mt-2 border-t border-gray-600 pt-1">
          Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
