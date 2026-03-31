import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useProfanityFilter } from "@/hooks/useProfanityFilter";
import { db, auth } from "@/integrations/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const WellnessJournal = () => {
  const [entry, setEntry] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const { toast } = useToast();
  const { filterProfanity } = useProfanityFilter();

  const fetchEntries = async () => {
    setEntriesLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) { setEntries([]); setEntriesLoading(false); return; }
      const q = collection(db, "journal_entries");
      const snapshot = await import("firebase/firestore").then(firestore =>
        firestore.getDocs(
          firestore.query(
            q,
            firestore.where("user_id", "==", user.uid),
            firestore.orderBy("created_at", "desc")
          )
        )
      );
      setEntries(snapshot.docs.map(doc => {
        let createdAt = doc.data().created_at;
        let dateObj = createdAt && createdAt.toDate ? createdAt.toDate() : (typeof createdAt === "string" ? new Date(createdAt) : new Date());
        return { id: doc.id, ...doc.data(), _createdAt: dateObj };
      }));
    } catch (e) {
      setEntries([]);
    } finally {
      setEntriesLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEntries();
    // eslint-disable-next-line
  }, []);

  const handleSave = async () => {
    if (!entry.trim()) {
      toast({ title: "Cannot save empty entry", description: "Write something first!", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({ title: "Not logged in", description: "Please log in to save journal entries", variant: "destructive" });
        return;
      }
      await addDoc(collection(db, "journal_entries"), {
        user_id: user.uid,
        content: filterProfanity(entry),
        is_private: isPrivate,
        created_at: serverTimestamp(),
        section: "wellness_goals"
      });
      toast({ title: "Journal entry saved!", description: "Your reflection was saved to your journal." });
      setEntry("");
      fetchEntries();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save journal entry", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Quick Journal</CardTitle>
        <CardDescription>Reflect on your wellness journey. Your entry will be saved to your private journal.</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          value={entry}
          onChange={e => setEntry(e.target.value)}
          rows={4}
          placeholder="Write your thoughts, feelings, or experiences here..."
          className="mb-4 w-full"
        />
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm">Private</span>
          <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
          <span className="text-sm text-gray-500">(Only you can see private entries)</span>
        </div>
        <Button onClick={handleSave} disabled={loading || !entry.trim()} className="w-full">
          {loading ? "Saving..." : "Save Entry"}
        </Button>
        <div className="mt-8">
          <div className="font-semibold mb-2 text-lg">Journal History</div>
          {entriesLoading ? (
            <div className="text-gray-400 text-center py-4">Loading entries...</div>
          ) : entries.length === 0 ? (
            <div className="text-gray-400 text-center py-4">No journal entries yet.</div>
          ) : (
            <div className="space-y-3">
              {entries.map(e => (
                <Card key={e.id} className="p-4 bg-gray-50 border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">{e.is_private ? "Private" : "Public"}</span>
                    <span className="text-xs text-gray-400">{e._createdAt ? e._createdAt.toLocaleString() : "Unknown date"}</span>
                  </div>
                  <div className="whitespace-pre-line text-gray-700 text-sm">{e.content}</div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WellnessJournal;
