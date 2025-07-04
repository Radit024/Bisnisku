import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import type { User as DbUser } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  dbUser: DbUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  dbUser: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Try to get existing user first
          const response = await apiRequest("GET", `/api/auth/user/${firebaseUser.uid}`);

          if (response.ok) {
            const userData = await response.json();
            setDbUser(userData);
          } else if (response.status === 404) {
            // User doesn't exist, create them
            const createResponse = await apiRequest("POST", "/api/auth/register", {
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email!,
              name: firebaseUser.displayName || firebaseUser.email!.split("@")[0],
              businessName: "",
            });

            if (createResponse.ok) {
              const userData = await createResponse.json();
              setDbUser(userData);
            } else {
              throw new Error("Failed to create user");
            }
          } else {
            throw new Error("Failed to authenticate user");
          }
        } catch (error) {
          console.error("Error handling user authentication:", error);
          setDbUser(null);
        }
      } else {
        setDbUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, dbUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}