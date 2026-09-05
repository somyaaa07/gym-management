import FaceCamera from "../components/FaceCamera";
import { useState, useEffect } from "react";
import { registerMemberFace } from "../services/memberFace.services";
import { loadFaceModels } from "../services/faceApi.services.js";

export default function FaceRegistration() {
    const [faceEmbedding, setFaceEmbedding] = useState(null);
    const [memberId, setMemberId] = useState("");
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [status, setStatus] = useState(null); 
    const [resetKey, setResetKey] = useState(0);// null | "saving" | "saved" | "error"

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
setMemberId("");
setFaceEmbedding(null);
setResetKey(prev => prev + 1);
        } catch (err) {
            console.log(err);
            setStatus("error");
        }
    };

    return (
        <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center px-4 py-12 font-body">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-display text-6xl leading-none text-bone-100 tracking-tightish">
                        Face Registration
                    </h1>
                    <p className="mt-2 text-sm text-bone-300">
                        Hold still in the frame. We'll lock a scan and tie it to a member.
                    </p>
                </div>

                {/* Scanner panel */}
                <div className="relative rounded-none border border-ink-600 bg-ink-900 shadow-panel p-4 mb-6">

                    {/* corner brackets */}
                    <span className={`pointer-events-none absolute left-2 top-2 h-6 w-6 border-l-2 border-t-2 transition-colors duration-300 ${faceEmbedding ? "border-volt-400" : "border-ink-500"}`} />
                    <span className={`pointer-events-none absolute right-2 top-2 h-6 w-6 border-r-2 border-t-2 transition-colors duration-300 ${faceEmbedding ? "border-volt-400" : "border-ink-500"}`} />
                    <span className={`pointer-events-none absolute left-2 bottom-2 h-6 w-6 border-l-2 border-b-2 transition-colors duration-300 ${faceEmbedding ? "border-volt-400" : "border-ink-500"}`} />
                    <span className={`pointer-events-none absolute right-2 bottom-2 h-6 w-6 border-r-2 border-b-2 transition-colors duration-300 ${faceEmbedding ? "border-volt-400" : "border-ink-500"}`} />

                    {!modelsLoaded && (
                        <div className="flex flex-col items-center justify-center gap-3 py-20">
                            <span className="h-8 w-8 rounded-full border-2 border-ink-600 border-t-volt-400 animate-spin" />
                            <p className="text-xs text-bone-300 tracking-tightish">Loading face models…</p>
                        </div>
                    )}

                    {modelsLoaded && (
                        <div className="relative overflow-hidden">
<FaceCamera onFaceDetected={handlefaceDatected} resetKey={resetKey} />
                            {!faceEmbedding && (
                                <div className="absolute inset-x-0 top-0 h-px bg-volt-400/70 animate-[scan_2.2s_ease-in-out_infinite]" />
                            )}
                        </div>
                    )}

                    {modelsLoaded && (
                        <div className="mt-3 flex items-center gap-2">
                            <span
                                className={`h-2 w-2 rounded-full ${faceEmbedding ? "bg-volt-400" : "bg-ink-500 animate-pulse"}`}
                            />
                            <span className={`text-xs font-medium ${faceEmbedding ? "text-volt-400" : "text-bone-300"}`}>
                                {faceEmbedding ? "Face locked" : "Looking for a face"}
                            </span>
                        </div>
                    )}
                </div>

                {/* Form */}
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Member ID"
                        value={memberId}
                        onChange={(e) => setMemberId(e.target.value)}
                        className="w-full bg-ink-900 border border-ink-600 px-4 py-3 text-sm text-bone-100 placeholder:text-ink-400 outline-none transition-colors duration-150 focus:border-volt-400"
                    />

                    <button
                        onClick={handleFaceRegister}
                        disabled={status === "saving"}
                        className="w-full bg-volt-400 hover:bg-volt-500 active:bg-volt-600 disabled:opacity-60 px-4 py-3 text-sm font-semibold text-ink-950 transition-colors duration-150"
                    >
                        {status === "saving" ? "Saving…" : "Register face"}
                    </button>

                    {status === "saved" && (
                        <p className="text-xs text-volt-400">Saved. This face is now tied to member {memberId}.</p>
                    )}
                    {status === "error" && (
                        <p className="text-xs text-ember-500">Couldn't save that. Check the connection and try again.</p>
                    )}
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