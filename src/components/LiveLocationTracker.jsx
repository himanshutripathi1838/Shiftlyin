import { collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { db } from "../services/firebase.js";

const MIN_UPDATE_SECONDS = 12;

export default function LiveLocationTracker() {
  const { currentUser, profile } = useAuth();
  const acceptedAppsRef = useRef([]);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (!currentUser?.uid || profile?.role !== "student") {
      acceptedAppsRef.current = [];
      return undefined;
    }

    return onSnapshot(
      query(
        collection(db, "applications"),
        where("studentId", "==", currentUser.uid),
        where("status", "==", "accepted")
      ),
      (snapshot) => {
        acceptedAppsRef.current = snapshot.docs.map((item) => item.id);
      }
    );
  }, [currentUser?.uid, profile?.role]);

  useEffect(() => {
    if (!currentUser?.uid || profile?.role !== "student" || !navigator.geolocation) {
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const acceptedAppIds = acceptedAppsRef.current;
        if (!acceptedAppIds.length) return;

        const now = Date.now();
        if (now - lastUpdateRef.current < MIN_UPDATE_SECONDS * 1000) return;
        lastUpdateRef.current = now;

        await Promise.allSettled(
          acceptedAppIds.map((applicationId) =>
            updateDoc(doc(db, "applications", applicationId), {
              studentLiveLatitude: position.coords.latitude,
              studentLiveLongitude: position.coords.longitude,
              studentLiveAccuracyMeters: position.coords.accuracy || null,
              studentLiveUpdatedAt: serverTimestamp()
            })
          )
        );
      },
      () => {},
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [currentUser?.uid, profile?.role]);

  return null;
}
