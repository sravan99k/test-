import React from "react";
import { addOrganization, addSchool } from "../services/novoAdminService";
import { getHierarchyForOrganization } from "../services/verifyService";

export default function AdminTestPanel() {
  const [lastOrgId, setLastOrgId] = React.useState<string | null>(null);

  const handleAddOrganization = async () => {
    try {
      const res = await addOrganization({
        name: "Acme Org",
        type: "NGO",
        location: "City Center",
        email: `org_${Date.now()}@example.com`,
        password: "Password123!",
        phone: "+1-555-0100",
        adminName: "Org Admin",
      });
      console.log("Add Organization result:", res);
      setLastOrgId(res.organizationId);

      // Immediately verify hierarchy
      const hierarchy = await getHierarchyForOrganization(res.organizationId);
      console.log("Organization hierarchy:", hierarchy);
      alert(`Organization created: ${res.organizationId}`);
    } catch (e) {
      console.error(e);
      alert("Failed to add organization. Check console.");
    }
  };

  const handleAddSchool = async () => {
    try {
      const res = await addSchool({
        name: "Springfield High",
        location: "Springfield",
        email: `school_${Date.now()}@example.com`,
        password: "Password123!",
        phone: "+1-555-0200",
        adminName: "School Admin",
        studentCount: 0,
        organizationId: lastOrgId || undefined,
      });
      console.log("Add School result:", res);
      if (lastOrgId) {
        const hierarchy = await getHierarchyForOrganization(lastOrgId);
        console.log("Updated hierarchy for", lastOrgId, hierarchy);
      }
      alert(`School created: ${res.schoolId}`);
    } catch (e) {
      console.error(e);
      alert("Failed to add school. Check console.");
    }
  };

  const handleVerifyLastOrg = async () => {
    if (!lastOrgId) {
      alert("No organization created in this session.");
      return;
    }
    const hierarchy = await getHierarchyForOrganization(lastOrgId);
    console.log("Verified hierarchy for", lastOrgId, hierarchy);
    alert(`Verified hierarchy for org: ${lastOrgId} (see console)`);
  };

  return (
    <div className="p-4 space-y-2 border rounded-md">
      <h3 className="font-semibold">Admin Test Panel</h3>
      <p className="text-sm">Temporary buttons for verifying Firestore writes.</p>
      <div className="flex gap-2">
        <button onClick={handleAddOrganization} className="px-3 py-2 bg-blue-600 text-white rounded">
          Add Organization (Test)
        </button>
        <button onClick={handleAddSchool} className="px-3 py-2 bg-green-600 text-white rounded" disabled={!lastOrgId}>
          Add School (Test)
        </button>
        <button onClick={handleVerifyLastOrg} className="px-3 py-2 bg-gray-700 text-white rounded">
          Verify Last Organization
        </button>
      </div>
      {lastOrgId && (
        <p className="text-xs text-gray-600">Last organization id: {lastOrgId}</p>
      )}
    </div>
  );
}
