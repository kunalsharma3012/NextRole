"use server";

import { db, auth } from "@/firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
  const { uid, name, email, isRecruiter } = params;

  try {
    const userRecord = await db.collection("users").doc(uid).get();

    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists.Please sign in instead.",
      };
    }

    // Import getRandomAvatarColor from utils
    const { getRandomAvatarColor } = await import("@/lib/utils");
    const avatarColor = getRandomAvatarColor();

    await db.collection("users").doc(uid).set({
      name,
      email,
      avatarColor,
      isRecruiter,
    });

    return {
      success: true,
      message: "Account created successfully . Please sign in.",
    };
  } catch (e: any) {
    console.error("Error creating a user", e);

    if (e.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use.",
      };
    }
    return {
      success: false,
      message: "Failed to create an account",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);

    if (!userRecord) {
      return {
        success: false,
        message: "User does not exist. Create an account instead.",
      };
    }

    await setSessionCookie(idToken);
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: "Failed to log into an account.",
    };
  }
}

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK * 1000,
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: ONE_WEEK,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();

    if (!userRecord) {
      return null;
    }

    const userData = userRecord.data();

    // If user doesn't have an avatar color, assign one and update the record
    if (!userData?.avatarColor) {
      const { getRandomAvatarColor } = await import("@/lib/utils");
      const avatarColor = getRandomAvatarColor();

      // Update user record with avatar color
      await db.collection("users").doc(decodedClaims.uid).update({
        avatarColor,
      });

      userData!.avatarColor = avatarColor;
    }

    return {
      ...userData,
      id: userRecord.id,
      isRecruiter: userData?.isRecruiter || false,
    } as User;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();

  return !!user; // returns true if user is authenticated, false otherwise. It convert the user object to a boolean by checking its truthiness.
}

export async function signOut() {
  const cookieStore = await cookies();

  cookieStore.set("session", "", {
    maxAge: 0, // Invalidate the cookie
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  return {
    success: true,
    message: "Successfully signed out.",
  };
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const userRecord = await db.collection("users").doc(userId).get();

    if (!userRecord.exists) {
      return null;
    }

    const userData = userRecord.data();

    // If user doesn't have an avatar color, assign one and update the record
    if (!userData?.avatarColor) {
      const { getRandomAvatarColor } = await import("@/lib/utils");
      const avatarColor = getRandomAvatarColor();

      // Update user record with avatar color
      await db.collection("users").doc(userId).update({
        avatarColor,
      });

      userData!.avatarColor = avatarColor;
    }

    return {
      id: userId,
      name: userData?.name,
      email: userData?.email,
      avatarColor: userData?.avatarColor,
      isRecruiter: userData?.isRecruiter || false,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
