import React, { useEffect, useRef } from "react";

export default function FaceCamera({ onFaceDetected, resetKey }) {
  const canvasRef = useRef(null)
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

          
          setTimeout(() => {
            if (faceDetectedRef.current) return;
            const canvas = canvasRef.current;
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const imageBase64 = canvas.toDataURL('image/jpeg');
            faceDetectedRef.current = true;
            onFaceDetected(imageBase64);
          },1000);
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
            <canvas ref={canvasRef} style={{ display: 'none' }} />

    </div>
  );
}