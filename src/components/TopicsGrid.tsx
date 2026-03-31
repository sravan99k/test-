import React, { useState } from "react";
import { topics } from "@/data/topics";
import { db } from "@/integrations/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const TopicCard = ({ topic, onReport }: any) => (
  <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
    <img
      src={topic.image}
      alt={topic.title}
      className="w-24 h-24 object-contain mb-2 rounded"
      style={{ padding: "8px", background: "#f6f6f6" }}
    />
    <h3 className="font-semibold text-lg text-center">{topic.title}</h3>
    <p className="text-sm text-gray-600 text-center mb-2">{topic.description}</p>
    <button
      className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      onClick={() => onReport(topic)}
    >
      Report Incident
    </button>
  </div>
);

const feelingsList = ["Sad", "Scared", "Angry", "Worried", "Hurt", "Frustrated"];

import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const TopicsGrid = () => {
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [description, setDescription] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [location, setLocation] = useState("");
  const [involved, setInvolved] = useState("");
  const [feelings, setFeelings] = useState<string[]>([]);
  const [additional, setAdditional] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioPreview, setAudioPreview] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleFeelingChange = (feeling: string) => {
    setFeelings((prev) =>
      prev.includes(feeling)
        ? prev.filter((f) => f !== feeling)
        : [...prev, feeling]
    );
  };

  // Audio recording logic
  const handleStartRecording = async () => {
    setAudioBlob(null);
    setAudioPreview("");
    setAudioUrl("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Audio recording is not supported in this browser or device.");
      setRecording(false);
      return;
    }
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new window.MediaRecorder(stream);
    setMediaRecorder(recorder);
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      setAudioBlob(blob);
      setAudioPreview(URL.createObjectURL(blob));
    };
    recorder.start();
  };


  const handleStopRecording = () => {
    setRecording(false);
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      let uploadedAudioUrl = "";
      if (audioBlob) {
        const storage = getStorage();
        const fileRef = storageRef(storage, `incident-audio/${Date.now()}-${selectedTopic.title}.webm`);
        await uploadBytes(fileRef, audioBlob);
        uploadedAudioUrl = await getDownloadURL(fileRef);
      }
      console.log("Submitting incident to Firestore", {
        topic: selectedTopic.title,
        description,
        anonymous,
        location,
        involved,
        feelings,
        additional,
        audioUrl: uploadedAudioUrl
      });
      await addDoc(collection(db, "incidents"), {
        topic: selectedTopic.title,
        description,
        anonymous,
        location,
        involved,
        feelings,
        additional,
        audioUrl: uploadedAudioUrl,
        timestamp: Timestamp.now(),
        status: "pending"
      });
      console.log("Incident submitted successfully");
      setStatus("success");
      setDescription("");
      setAnonymous(true);
      setLocation("");
      setInvolved("");
      setFeelings([]);
      setAdditional("");
      setAudioBlob(null);
      setAudioPreview("");
      setAudioUrl("");
    } catch (err) {
      setStatus("error");
    }
  };


  return (
    <>

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-2">
          <div className="h-6 w-1.5 bg-blue-600 rounded mr-2"></div>
          <h3 className="text-lg font-semibold text-blue-800">Choose a Concern to Report</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4 bg-white rounded shadow-md">
          {topics.map((topic) => (
            <TopicCard key={topic.title} topic={topic} onReport={setSelectedTopic} />
          ))}
        </div>
      </div>
      {/* Modal */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">
              Report Incident: {selectedTopic.title}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-2 flex items-center">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="anonymous" className="text-sm">Keep my report anonymous (recommended)</label>
              </div>
              <label className="block text-sm font-medium mb-1">What happened? Tell us your story *</label>
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <textarea
                  className="w-full border rounded p-2"
                  placeholder="Describe what happened in as much detail as you're comfortable sharing..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{ minWidth: 0 }}
                />
                <div className="flex flex-col items-center justify-start min-w-[120px]">
                  {!recording && (
                    <button
                      type="button"
                      className="mb-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                      onClick={handleStartRecording}
                    >
                      {audioPreview ? "Re-record" : "Record Audio"}
                    </button>
                  )}
                  {recording && (
                    <button
                      type="button"
                      className="mb-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      onClick={handleStopRecording}
                    >
                      Stop Recording
                    </button>
                  )}
                  {audioPreview && (
                    <audio controls src={audioPreview} className="w-full">
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
              </div>
              <label className="block text-sm font-medium mb-1">Where did this happen?</label>
              <input
                className="w-full border rounded p-2 mb-3"
                placeholder="e.g., School hallway, classroom, online, etc."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                type="text"
              />
              <label className="block text-sm font-medium mb-1">Who was involved? (Optional)</label>
              <input
                className="w-full border rounded p-2 mb-3"
                placeholder="You can use initials or descriptions if you don't want to use names"
                value={involved}
                onChange={(e) => setInvolved(e.target.value)}
                type="text"
              />
              <label className="block text-sm font-medium mb-1">How are you feeling? (Select all that apply)</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {feelingsList.map((feeling) => (
                  <button
                    type="button"
                    key={feeling}
                    className={`px-3 py-1 rounded border ${feelings.includes(feeling) ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'} transition`}
                    onClick={() => handleFeelingChange(feeling)}
                  >
                    {feeling}
                  </button>
                ))}
              </div>
              <label className="block text-sm font-medium mb-1">Anything else you'd like to add?</label>
              <textarea
                className="w-full border rounded p-2 mb-3"
                placeholder="Any additional details, concerns, or requests for help..."
                value={additional}
                onChange={(e) => setAdditional(e.target.value)}
                rows={2}
              />
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => {
                    setSelectedTopic(null);
                    setStatus("idle");
                  }}
                  disabled={status === "submitting"}
                >
                  {status === "success" ? "Close" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
            {status === "success" && (
              <div className="mt-3 text-green-700 font-semibold">
                Thank you for reporting! A counselor will review your report. For urgent help, contact your school or a helpline.<br/>
                {audioPreview && (
                  <div className="mt-2">
                    <span className="block text-sm text-gray-700 mb-1">Your submitted audio:</span>
                    <audio controls src={audioPreview} className="w-full">
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>
            )}
            {status === "error" && (
              <div className="mt-3 text-red-600 font-semibold">
                Something went wrong. Please try again.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TopicsGrid;
