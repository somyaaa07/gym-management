import { useEffect, useState } from "react";
import FaceCamera from "../components/FaceCamera";
import { loadFaceModels } from "../services/faceApi.services";
import { verifyMemberFace } from "../services/memberFace.services";

const FaceVerification = () => {
    const [faceEmbedding, setFaceEmbedding] = useState(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            await loadFaceModels();
            setModelsLoaded(true);
        };
        loadModels();
    }, []);

    const handlefaceDatected = (embedding) => {
        setFaceEmbedding(embedding);
        if (verificationResult) setVerificationResult(null);
    };

    const handleVerification = async () => {
        if (!faceEmbedding) {
            alert("Please detect your face first");
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
        responseData?.distance != null
            ? Math.max(0, 1 - responseData.distance)
            : null;

    const headline = !modelsLoaded
        ? "Waking up the scanner."
        : isError
        ? "Couldn't reach the verifier."
        : loading
        ? "Checking."
        : matched === true
        ? memberName
            ? `Match found — ${memberName}.`
            : "Match found."
        : matched === false
        ? "No match found."
        : verificationResult
        ? "Verification complete."
        : !faceEmbedding
        ? "Center your face in the frame."
        : "Ready to verify.";

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
<FaceCamera onFaceDetected={handlefaceDatected} />                            {!faceEmbedding && (
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

                {/* Result readout */}
                {verificationResult && !isError && (
                    <div
                        className={`mt-6 border-l-4 px-4 py-3 ${
                            matched === true
                                ? "border-volt-400 bg-ink-900"
                                : matched === false
                                ? "border-ember-500 bg-ink-900"
                                : "border-ink-600 bg-ink-900"
                        }`}
                    >
                        {memberName && <p className="text-sm text-bone-100">{memberName}</p>}
                        {confidence != null && (
                            <p className="text-xs text-bone-300 mt-0.5">
                                Confidence {typeof confidence === "number" ? Math.round(confidence * (confidence <= 1 ? 100 : 1)) + "%" : String(confidence)}
                            </p>
                        )}
                        {!memberName && confidence == null && (
                            <pre className="text-xs text-bone-300 whitespace-pre-wrap font-body">
                                {JSON.stringify(verificationResult, null, 2)}
                            </pre>
                        )}
                    </div>
                )}

                {isError && (
                    <p className="mt-6 text-sm text-ember-500">
                        Something went wrong reaching the server. Try again.
                    </p>
                )}

                {/* Control */}
                <button
                    onClick={handleVerification}
                    disabled={!faceEmbedding || loading}
                    className="mt-8 w-full bg-volt-400 hover:bg-volt-500 active:bg-volt-600 disabled:opacity-40 px-6 py-3 text-sm font-semibold text-ink-950 transition-colors duration-150"
                >
                    {loading ? "Verifying…" : "Verify face"}
                </button>
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