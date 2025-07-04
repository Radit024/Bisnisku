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
          // Get or create user in database
          const response = await apiRequest("GET", `/api/auth/user/${firebaseUser.uid}`);

          if (response.ok) {
            const userData = await response.json();
            setDbUser(userData);
          } else {
            // User doesn't exist in DB, create them
            const createResponse = await apiRequest("POST", "/api/auth/register", {
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email!,
              name: firebaseUser.displayName || firebaseUser.email!.split("@")[0],
              businessName: "",
            });

            if (createResponse.ok) {
              const userData = await createResponse.json();
              setDbUser(userData);
            }
          }
        } catch (error) {
          console.error("Error handling user authentication:", error);
        }
      } else {
        setDbUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user && !dbUser) {
      const createOrGetUser = async () => {
        try {
          setLoading(true);
          const response = await apiRequest(`/api/auth/user/${user.uid}`, {
            method: "POST",
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              name: user.displayName || user.email?.split("@")[0] || "User",
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to create/get user");
          }

          const userData = await response.json();
          if (userData && userData.id) {
            setDbUser(userData);
          } else {
            throw new Error("Invalid user data received");
          }
        } catch (error) {
          console.error("Error handling user authentication:", error);
          // Don't set dbUser to null immediately, keep trying
          setTimeout(() => {
            if (user && !dbUser) {
              createOrGetUser();
            }
          }, 2000);
        } finally {
          setLoading(false);
        }
      };

      createOrGetUser();
    } else if (!user) {
      setDbUser(null);
      setLoading(false);
    } else if (user && dbUser) {
      setLoading(false);
    }
  }, [user, dbUser]);

  return (
    <AuthContext.Provider value={{ user, dbUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}