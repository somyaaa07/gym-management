import { useState } from "react";
import FaceCamera from "../components/FaceCamera";
import { verifyMemberFace } from "../services/memberFace.services";
import usePageMeta from "../lib/usePageMeta.js";
import Button from "../components/ui/Button.jsx";
import { ScanFace, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

const FaceVerification = () => {
  usePageMeta("Face Verification", "Scan a member's face to confirm who they are");

  const [faceEmbedding, setFaceEmbedding] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handlefaceDatected = (embedding) => {
    setFaceEmbedding(embedding);
    if (verificationResult) setVerificationResult(null);
  };

  const handleVerification = async () => {
    setFormError("");
    if (!faceEmbedding) {
      setFormError("Center your face in the frame first — we'll lock a scan automatically.");
      return;
    }

    try {
      setLoading(true);
      const result = await verifyMemberFace(faceEmbedding);
      console.log(result);
      setVerificationResult(result);
    } catch (err) {
      console.log(err);
      setVerificationResult({ error: true });
    } finally {
      setLoading(false);
    }
  };

  // The backend returns { success, message, data: { member_name, distance, ... } }
  // on a match, and { success: false, message } when it can't verify.
  const isError = verificationResult?.error;
  const responseData = verificationResult?.data;
  const matched = !isError ? verificationResult?.success ?? false : null;
  const memberName = responseData?.member_name;
  // distance is a "lower is better" euclidean score, not 0-1 confidence —
  // convert it to a rough 0-100% so it reads the way the UI expects.
  const confidence =
    responseData?.distance != null ? Math.max(0, 1 - responseData.distance) : null;
  const confidencePct =
    confidence != null ? Math.round(confidence * (confidence <= 1 ? 100 : 1)) : null;

  const locked = Boolean(faceEmbedding);

  return (
    <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-6 items-start">
      {/* Scanner card */}
      <div className="surface-card p-4 sm:p-5">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-ink-950">
          <span className={`pointer-events-none absolute left-4 top-4 h-9 w-9 border-l-[3px] border-t-[3px] rounded-tl-lg transition-colors duration-300 z-10 ${locked ? "border-volt-400" : "border-white/40"}`} />
          <span className={`pointer-events-none absolute right-4 top-4 h-9 w-9 border-r-[3px] border-t-[3px] rounded-tr-lg transition-colors duration-300 z-10 ${locked ? "border-volt-400" : "border-white/40"}`} />
          <span className={`pointer-events-none absolute left-4 bottom-4 h-9 w-9 border-l-[3px] border-b-[3px] rounded-bl-lg transition-colors duration-300 z-10 ${locked ? "border-volt-400" : "border-white/40"}`} />
          <span className={`pointer-events-none absolute right-4 bottom-4 h-9 w-9 border-r-[3px] border-b-[3px] rounded-br-lg transition-colors duration-300 z-10 ${locked ? "border-volt-400" : "border-white/40"}`} />

          <FaceCamera onFaceDetected={handlefaceDatected} />

          {!locked && (
            <div className="absolute inset-x-0 top-0 h-0.5 bg-volt-400/80 shadow-[0_0_12px_2px_rgba(140,126,248,0.6)] animate-[scan_2.4s_ease-in-out_infinite] z-10" />
          )}

          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-colors ${
                locked ? "bg-volt-500/90 text-white" : "bg-black/40 text-white/85"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${locked ? "bg-white" : "bg-white/70 animate-pulse"}`} />
              {locked ? "Face locked" : "Center your face"}
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {formError && (
            <p className="flex items-start gap-2 text-xs text-ember-600 bg-ember-500/10 border border-ember-500/20 rounded-xl px-3.5 py-2.5">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              {formError}
            </p>
          )}

          <Button onClick={handleVerification} loading={loading} className="w-full">
            <ScanFace size={16} />
            {loading ? "Verifying…" : "Verify face"}
          </Button>
        </div>
      </div>

      {/* Result panel */}
      <div className="space-y-4">
        {!verificationResult && !loading && (
          <div className="surface-card p-6 flex flex-col items-center text-center gap-3">
            <div className="rounded-2xl bg-gradient-brand-soft p-3.5">
              <ScanFace size={22} className="text-volt-500" />
            </div>
            <h2 className="font-display text-lg font-bold text-bone-100">Ready when you are</h2>
            <p className="text-sm text-ink-400 leading-relaxed max-w-xs">
              Hold still in the frame — once a face locks, hit "Verify face" to check it against
              your members.
            </p>
          </div>
        )}

        {loading && (
          <div className="surface-card p-8 flex flex-col items-center text-center gap-3">
            <span className="h-9 w-9 rounded-full border-2 border-ink-600 border-t-volt-500 animate-spin" />
            <p className="text-sm font-medium text-bone-100">Checking against your members…</p>
          </div>
        )}

        {verificationResult && !loading && isError && (
          <div className="surface-card p-6 flex flex-col items-center text-center gap-3 border-ember-500/30">
            <div className="rounded-2xl bg-ember-500/10 p-3.5">
              <XCircle size={22} className="text-ember-500" />
            </div>
            <h2 className="font-display text-lg font-bold text-bone-100">Couldn't reach the verifier</h2>
            <p className="text-sm text-ink-400 leading-relaxed max-w-xs">
              Something went wrong contacting the server. Check the connection and try again.
            </p>
          </div>
        )}

        {verificationResult && !loading && !isError && matched === true && (
          <div className="surface-card p-6 sm:p-7 flex flex-col items-center text-center gap-3">
            <div className="rounded-full bg-volt-500/10 p-4">
              <CheckCircle2 size={30} className="text-volt-500" />
            </div>
            <h2 className="font-display text-2xl font-bold text-bone-100">
              {memberName ? memberName : "Match found"}
            </h2>
            <p className="text-sm text-volt-600 font-medium">Identity confirmed</p>

            {confidencePct != null && (
              <div className="w-full max-w-[220px] mt-2">
                <div className="flex items-center justify-between text-[11px] text-ink-400 mb-1.5">
                  <span>Confidence</span>
                  <span className="font-semibold text-bone-100">{confidencePct}%</span>
                </div>
                <div className="h-2 rounded-full bg-ink-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-brand transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(4, confidencePct))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {verificationResult && !loading && !isError && matched === false && (
          <div className="surface-card p-6 sm:p-7 flex flex-col items-center text-center gap-3">
            <div className="rounded-full bg-ember-500/10 p-4">
              <XCircle size={30} className="text-ember-500" />
            </div>
            <h2 className="font-display text-2xl font-bold text-bone-100">No match found</h2>
            <p className="text-sm text-ink-400 leading-relaxed max-w-xs">
              We couldn't match this face to a registered member. Try again with better lighting,
              or register this face first.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default FaceVerification;
