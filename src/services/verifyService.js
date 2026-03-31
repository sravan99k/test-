import { db } from "../integrations/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export async function getOrganization(orgId) {
  const snap = await getDoc(doc(db, "organizations", orgId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listSchoolsByOrganization(orgId) {
  const q = query(
    collection(db, "schools"),
    where("organizationId", "==", doc(db, "organizations", orgId))
  );
  const snaps = await getDocs(q);
  return snaps.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getHierarchyForOrganization(orgId) {
  const organization = await getOrganization(orgId);
  if (!organization) return null;
  const schools = await listSchoolsByOrganization(orgId);
  return { organization, schools };
}
