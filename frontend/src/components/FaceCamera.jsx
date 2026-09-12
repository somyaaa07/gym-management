import React, { useEffect, useRef, useState } from "react";
import { VideoOff } from "lucide-react";

export default function FaceCamera({ onFaceDetected, resetKey }) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const faceDetectedRef = useRef(false);
  const [capturedPreview, setCapturedPreview] = useState(null);
  // Purely presentational — lets us show a loading / permission-error state
  // instead of a blank black box while the camera spins up.
  const [cameraState, setCameraState] = useState("requesting"); // requesting | streaming | error

  useEffect(() => {
    faceDetectedRef.current = false;
  }, [resetKey]);

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        setCameraState("requesting");
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraState("streaming");

          setTimeout(() => {
            if (faceDetectedRef.current) return;
            const canvas = canvasRef.current;
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const imageBase64 = canvas.toDataURL("image/jpeg");
            setCapturedPreview(imageBase64);
            console.log("CAPTURED IMAGE:", imageBase64);
            faceDetectedRef.current = true;
            onFaceDetected(imageBase64);
          }, 1000);
        };
      } catch (error) {
        console.log("Camera error:", error);
        setCameraState("error");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onFaceDetected]);

  return (
    <div className="relative h-full w-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`h-full w-full object-cover [transform:scaleX(-1)] transition-opacity duration-300 ${
          cameraState === "streaming" ? "opacity-100" : "opacity-0"
        }`}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {capturedPreview && (
    <img src={capturedPreview} alt="captured" width="200" style={{ marginTop: '10px', border: '2px solid lime' }} />
)}

      {cameraState === "requesting" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-950">
          <span className="h-9 w-9 rounded-full border-2 border-white/20 border-t-volt-400 animate-spin" />
          <p className="text-xs font-medium text-white/70">Requesting camera access…</p>
        </div>
      )}

      {cameraState === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-950 px-6 text-center">
          <div className="rounded-2xl bg-white/10 p-3">
            <VideoOff size={22} className="text-white/70" />
          </div>
          <p className="text-sm font-medium text-white">Camera access is blocked</p>
          <p className="text-xs text-white/55 max-w-[220px] leading-relaxed">
            Allow camera permission for this site in your browser settings, then reload the page.
          </p>
        </div>
      )}
    </div>
  );
}
