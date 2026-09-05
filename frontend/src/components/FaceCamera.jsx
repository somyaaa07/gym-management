import React, { useEffect, useRef } from "react";
import { detectFace } from "../services/faceApi.services";

export default function FaceCamera({ onFaceDetected }) {

  const videoRef = useRef(null);
  const faceDetectedRef = useRef(false);

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

if (detection && !faceDetectedRef.current) {

    faceDetectedRef.current = true;

    const embedding = Array.from(detection.descriptor);

    console.log("Embedding length:", embedding.length);

    onFaceDetected(embedding);
}
          else {

              console.log("No face detected");

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