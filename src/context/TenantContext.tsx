import React, { createContext, useContext, useEffect, useState } from "react";
import { initializeTenantFirebase, db as masterDb, auth as masterAuth, clearTenantConfig } from "../services/firebase";
import { doc, onSnapshot, Firestore } from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { User, TenantConfig } from "../types/models";

interface TenantContextType {
  tenantDb: Firestore | null;
  tenantConfig: TenantConfig | null;
  userProfile: User | null;
  loading: boolean;
  isSuperAdmin: boolean;
  isTenantConfigured: boolean;
  refreshTenant: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
};

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantDb, setTenantDb] = useState<Firestore | null>(null);
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  const superAdminEmail = import.meta.env.VITE_SUPER_ADMIN_EMAIL;

  // Listen for Auth Changes
  useEffect(() => {
    if (!masterAuth) {
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(masterAuth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        // Logged out
        setTenantDb(null);
        setTenantConfig(null);
        setUserProfile(null);
        clearTenantConfig();
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen for Profile Changes (Master DB)
  useEffect(() => {
    if (!firebaseUser || !masterDb) return;

    const userDocRef = doc(masterDb, "users", firebaseUser.uid);

    // Subscribe to profile changes
    const unsubscribeProfile = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data() as User;
          setUserProfile(userData);

          // Check if tenant config exists and has changed
          if (userData.tenantConfig) {
            // Only re-initialize if config changed significantly (deep comparison or just id)
            // For simplicity, we just check if it exists and differs from current state
            // In a real app, use a hook or memo to avoid re-init loops

            // Should initiate tenant DB
            // We can check if keys are present
            if (userData.tenantConfig.apiKey) {
              const { db, initialized } = initializeTenantFirebase({
                apiKey: userData.tenantConfig.apiKey,
                authDomain: userData.tenantConfig.authDomain,
                projectId: userData.tenantConfig.projectId,
                storageBucket: userData.tenantConfig.storageBucket,
                messagingSenderId: userData.tenantConfig.messagingSenderId,
                appId: userData.tenantConfig.appId,
              });

              if (initialized) {
                setTenantDb(db);
                setTenantConfig(userData.tenantConfig);
              }
            }
          } else {
            // No tenant config, maybe they are just an employee or unconfigured admin
            // If they are an employee, we need to fetch their Employer's config!
            // TODO: Employee logic (later)
            setTenantDb(null);
            setTenantConfig(null);
          }
        } else {
          // Profile doesn't exist yet?
          setUserProfile(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching user profile:", error);
        setLoading(false);
      },
    );

    return () => unsubscribeProfile();
  }, [firebaseUser]);

  const refreshTenant = () => {
    // Force re-read or re-init if needed
  };

  const isSuperAdmin = userProfile?.email === superAdminEmail;
  const isTenantConfigured = !!tenantDb; // If DB is ready, we are configured

  return (
    <TenantContext.Provider
      value={{
        tenantDb,
        tenantConfig,
        userProfile,
        loading,
        isSuperAdmin,
        isTenantConfigured,
        refreshTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};
