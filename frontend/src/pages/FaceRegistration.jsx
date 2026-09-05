import FaceCamera from "../components/FaceCamera";
import { useState, useEffect } from "react";
import { registerMemberFace } from "../services/memberFace.services";
import { loadFaceModels } from "../services/faceApi.services.js";

export default function FaceRegistration() {
    const [faceEmbedding, setFaceEmbedding] = useState(null);
    const [memberId, setMemberId] = useState("");
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [status, setStatus] = useState(null); // null | "saving" | "saved" | "error"

    useEffect(() => {
        const loadModels = async () => {
            await loadFaceModels();
            setModelsLoaded(true);
        };
        loadModels();
    }, []);

    const handlefaceDatected = (embedding) => {
        setFaceEmbedding(embedding);
        if (status) setStatus(null);
    };

    const handleFaceRegister = async () => {
        if (!memberId) {
            alert("Please enter member id");
            return;
        }
        if (!faceEmbedding) {
            alert("Please detect face");
            return;
        }
        try {
            setStatus("saving");
            const res = await registerMemberFace(memberId, faceEmbedding);
            console.log(res);
            setStatus("saved");
        } catch (err) {
            console.log(err);
            setStatus("error");
        }
    };

    // The headline reads like a kiosk screen talking to you — it changes with
    // what's actually happening instead of sitting there as static copy.
    const headline = !modelsLoaded
        ? "Waking up the scanner."
        : status === "saving"
        ? "Saving."
        : status === "saved"
        ? `Saved. Locked to member ${memberId}.`
        : status === "error"
        ? "That didn't save. Try again."
        : !faceEmbedding
        ? "Center your face in the frame."
        : !memberId
        ? "Face locked. Whose is it?"
        : "Ready when you are.";

    return (
        <div className="min-h-screen bg-ink-950 flex flex-col font-body">
            <div className="mx-auto w-full max-w-2xl flex-1 flex flex-col px-6 py-10 sm:py-14">

                {/* Scan viewport — the hero */}
                <div className="relative w-full aspect-[4/3] sm:aspect-video bg-ink-900 overflow-hidden">
                    <span className={`pointer-events-none absolute left-3 top-3 h-9 w-9 border-l-4 border-t-4 transition-colors duration-300 ${faceEmbedding ? "border-volt-400" : "border-ink-500"}`} />
                    <span className={`pointer-events-none absolute right-3 top-3 h-9 w-9 border-r-4 border-t-4 transition-colors duration-300 ${faceEmbedding ? "border-volt-400" : "border-ink-500"}`} />
                    <span className={`pointer-events-none absolute left-3 bottom-3 h-9 w-9 border-l-4 border-b-4 transition-colors duration-300 ${faceEmbedding ? "border-volt-400" : "border-ink-500"}`} />
                    <span className={`pointer-events-none absolute right-3 bottom-3 h-9 w-9 border-r-4 border-b-4 transition-colors duration-300 ${faceEmbedding ? "border-volt-400" : "border-ink-500"}`} />

                    {!modelsLoaded ? (
                        <div className="h-full flex items-center justify-center">
                            <span className="h-10 w-10 rounded-full border-2 border-ink-600 border-t-volt-400 animate-spin" />
                        </div>
                    ) : (
                        <>
                            <FaceCamera onFaceDetected={handlefaceDatected} />
                            {!faceEmbedding && (
                                <div className="absolute inset-x-0 top-0 h-px bg-volt-400/70 shadow-[0_0_12px_2px_rgba(214,249,78,0.5)] animate-[scan_2.4s_ease-in-out_infinite]" />
                            )}
                            {faceEmbedding && (
                                <div className="absolute inset-0 ring-1 ring-inset ring-volt-400/40" />
                            )}
                        </>
                    )}
                </div>

                {/* Reactive headline */}
                <h1 className="font-display mt-8 text-5xl sm:text-6xl leading-[0.92] tracking-tightish text-bone-100">
                    {headline}
                </h1>

                <div className="flex-1" />

                {/* Control bar */}
                <div className="mt-10 flex flex-col sm:flex-row sm:items-end gap-4">
                    <label className="flex-1 block">
                        <span className="block text-xs text-bone-300 mb-1">Member ID</span>
                        <input
                            type="text"
                            placeholder="e.g. M-0231"
                            value={memberId}
                            onChange={(e) => setMemberId(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-ink-600 pb-2 text-lg text-bone-100 placeholder:text-ink-500 outline-none transition-colors duration-150 focus:border-volt-400"
                        />
                    </label>

                    <button
                        onClick={handleFaceRegister}
                        disabled={status === "saving"}
                        className="shrink-0 bg-volt-400 hover:bg-volt-500 active:bg-volt-600 disabled:opacity-60 px-6 py-3 text-sm font-semibold text-ink-950 transition-colors duration-150"
                    >
                        {status === "saving" ? "Saving…" : "Register face"}
                    </button>
                </div>

                {status === "error" && (
                    <p className="mt-3 text-sm text-ember-500">Check the connection and try again.</p>
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
}