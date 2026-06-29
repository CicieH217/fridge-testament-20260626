import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Load user profile from Firestore
        const profileRef = doc(db, "users", firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setUserProfile(profileSnap.data());
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const register = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });

    // Create user document in Firestore
    await setDoc(doc(db, "users", result.user.uid), {
      email,
      displayName,
      createdAt: new Date().toISOString(),
      healthProfile: {
        height: 170,
        weight: 65,
        age: 30,
        gender: "male",
        activityLevel: "moderate",
        showProfileSetup: false,
      },
      healthGoal: "maintain",
      nutritionGoals: {
        calories: 2000,
        protein: 60,
        fat: 65,
        carbs: 250,
        fiber: 25,
      },
      dietaryPreferences: [],
      favoriteRecipes: [],
      cookingHistory: [],
      mealHistory: [],
    });

    return result.user;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserData = async (data) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, data, { merge: true });
    setUserProfile((prev) => ({ ...prev, ...data }));
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    updateUserData,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
