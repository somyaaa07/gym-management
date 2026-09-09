import FaceCamera from "../components/FaceCamera";
import { useState } from "react";
import { registerMemberFace } from "../services/memberFace.services";
import usePageMeta from "../lib/usePageMeta.js";
import { Field, Input } from "../components/ui/Field.jsx";
import Button from "../components/ui/Button.jsx";
import { ScanFace, CheckCircle2, AlertCircle, IdCard, Camera, Fingerprint } from "lucide-react";

const STEPS = [
  { icon: IdCard, text: "Enter the member's ID so we know whose face this is." },
  { icon: Camera, text: "Look straight at the camera in good, even light." },
  { icon: Fingerprint, text: "Hold still for a second while we lock the scan." },
];

export default function FaceRegistration() {
  usePageMeta("Face Registration", "Link a member's face to their profile for check-ins");

  const [faceEmbedding, setFaceEmbedding] = useState(null);
  const [memberId, setMemberId] = useState("");
  const [status, setStatus] = useState(null); // null | "saving" | "saved" | "error"
  const [formError, setFormError] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const handlefaceDatected = (embedding) => {
    setFaceEmbedding(embedding);
    if (status) setStatus(null);
  };

  const handleFaceRegister = async () => {
    setFormError("");

    if (!memberId) {
      setFormError("Enter a member ID before registering a face.");
      return;
    }
    if (!faceEmbedding) {
      setFormError("Hold still in the frame so we can capture a face first.");
      return;
    }

    try {
      setStatus("saving");
      const res = await registerMemberFace(memberId, faceEmbedding);
      console.log(res);
      setStatus("saved");
      setMemberId("");
      setFaceEmbedding(null);
      setResetKey((prev) => prev + 1);
    } catch (err) {
      console.log(err);
      setStatus("error");
    }
  };

  const locked = Boolean(faceEmbedding);

  return (
    <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-6 items-start">
      {/* Scanner card */}
      <div className="surface-card p-4 sm:p-5">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-ink-950">
          {/* corner brackets */}
          <span className={`pointer-events-none absolute left-4 top-4 h-8 w-8 border-l-[3px] border-t-[3px] rounded-tl-lg transition-colors duration-300 z-10 ${locked ? "border-volt-400" : "border-white/40"}`} />
          <span className={`pointer-events-none absolute right-4 top-4 h-8 w-8 border-r-[3px] border-t-[3px] rounded-tr-lg transition-colors duration-300 z-10 ${locked ? "border-volt-400" : "border-white/40"}`} />
          <span className={`pointer-events-none absolute left-4 bottom-4 h-8 w-8 border-l-[3px] border-b-[3px] rounded-bl-lg transition-colors duration-300 z-10 ${locked ? "border-volt-400" : "border-white/40"}`} />
          <span className={`pointer-events-none absolute right-4 bottom-4 h-8 w-8 border-r-[3px] border-b-[3px] rounded-br-lg transition-colors duration-300 z-10 ${locked ? "border-volt-400" : "border-white/40"}`} />

          <FaceCamera onFaceDetected={handlefaceDatected} resetKey={resetKey} />

          {!locked && (
            <div className="absolute inset-x-0 top-0 h-0.5 bg-volt-400/80 shadow-[0_0_12px_2px_rgba(140,126,248,0.6)] animate-[scan_2.2s_ease-in-out_infinite] z-10" />
          )}

          {/* status pill overlaid on the frame */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-colors ${
                locked ? "bg-volt-500/90 text-white" : "bg-black/40 text-white/85"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${locked ? "bg-white" : "bg-white/70 animate-pulse"}`} />
              {locked ? "Face locked" : "Looking for a face"}
            </span>
          </div>
        </div>

        {/* Member ID + submit, right under the scanner */}
        <div className="mt-5 space-y-3">
          <Field label="Member ID" required>
            <Input
              type="text"
              placeholder="e.g. 104"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            />
          </Field>

          {formError && (
            <p className="flex items-start gap-2 text-xs text-ember-600 bg-ember-500/10 border border-ember-500/20 rounded-xl px-3.5 py-2.5">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              {formError}
            </p>
          )}

          {status === "saved" && (
            <p className="flex items-start gap-2 text-xs text-volt-600 bg-volt-500/10 border border-volt-500/20 rounded-xl px-3.5 py-2.5">
              <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
              Saved — this face is now tied to that member's profile.
            </p>
          )}
          {status === "error" && (
            <p className="flex items-start gap-2 text-xs text-ember-600 bg-ember-500/10 border border-ember-500/20 rounded-xl px-3.5 py-2.5">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              Couldn't save that. Check the connection and try again.
            </p>
          )}

          <Button onClick={handleFaceRegister} loading={status === "saving"} className="w-full">
            <ScanFace size={16} />
            {status === "saving" ? "Saving…" : "Register face"}
          </Button>
        </div>
      </div>

      {/* Guidance panel */}
      <div className="space-y-4">
        <div className="surface-card p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="rounded-xl bg-gradient-brand-soft p-2.5">
              <ScanFace size={18} className="text-volt-500" />
            </div>
            <h2 className="font-display text-lg font-bold text-bone-100">How this works</h2>
          </div>
          <p className="text-sm text-ink-400 mt-1 mb-5 leading-relaxed">
            This scan is stored against the member so they can be recognised at check-in without a
            card or code.
          </p>

          <ol className="space-y-4">
            {STEPS.map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="grid place-items-center h-8 w-8 rounded-full bg-ink-900 border border-ink-600 text-xs font-bold text-volt-600 shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-bone-200 leading-relaxed pt-1">{text}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-dashed border-ink-600 bg-ink-800/50 p-5">
          <p className="text-xs font-semibold text-bone-200 mb-1.5">Tip</p>
          <p className="text-xs text-ink-400 leading-relaxed">
            If the frame doesn't lock after a few seconds, check the lighting or move closer — the
            scan retries automatically as soon as a clear face is in view.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(260px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
