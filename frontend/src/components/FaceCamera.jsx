import React, { useEffect, useRef } from "react";
import { detectFace } from "../services/faceApi.services";

export default function FaceCamera({ onFaceDetected ,resetKey}) {

  const videoRef = useRef(null);
  const faceDetectedRef = useRef(false);
  useEffect(() => {
    faceDetectedRef.current = false;
}, [resetKey]);

  useEffect(() => {

    let stream;

    const startCamera = async () => {
      try {

        stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });

        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {

          videoRef.current.play();

          // camera ko properly start hone ka time
          setTimeout(async () => {

            const detection = await detectFace(videoRef.current);

            console.log("Detection:", detection);

            // A low detection score usually means a blurry, angled, or
            // partially-out-of-frame face. Embedding that frame poisons the
            // reference (on registration) or produces an unreliable sample
            // (on verification), so we reject it here instead of using it.
            const MIN_DETECTION_SCORE = 0.8;
            const isGoodDetection =
                detection && (detection.detection?.score ?? 1) >= MIN_DETECTION_SCORE;

if (isGoodDetection && !faceDetectedRef.current) {

    faceDetectedRef.current = true;

    const embedding = Array.from(detection.descriptor);

    console.log("Embedding length:", embedding.length);

    onFaceDetected(embedding);
}
          else {

              console.log("No face detected (or detection quality too low)");

            }

          }, 1000);
        };

      } catch (error) {

        console.log("Camera error:", error);

      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };

  }, [onFaceDetected]);


  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="500"
      />
    </div>
  );
}