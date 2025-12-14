"use server";

import type { Firestore } from "firebase-admin/firestore";
import { serverTimestamp } from "@/lib/firebase/admin";

const getTodayIsoDate = () => new Date().toISOString().split("T")[0];


export async function archivePastSessions(db: Firestore) {
  const todayKey = getTodayIsoDate();
  const outdatedSnap = await db
    .collection("sessions")
    .where("date", "<", todayKey)
    .get();

  if (outdatedSnap.empty) {
    return 0;
  }

  const batch = db.batch();
  outdatedSnap.forEach((doc) => {
    batch.update(doc.ref, {
      status: "archived",
      archivedAt: serverTimestamp(),
    });
  });

  await batch.commit();
  return outdatedSnap.size;
}
