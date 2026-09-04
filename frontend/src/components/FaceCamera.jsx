import React, { useRef } from 'react';
import { useEffect } from 'react';

export default function FaceCamera() {
    const videoRef = useRef(null);
    useEffect(()=>{
        const startCamera = async()=>{
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
           videoRef.current.srcObject = stream; 
     } ;
     startCamera();
    },[]);


  return (
    <div>
          <video
                ref={videoRef}
                autoPlay
                playsInline
            />
    </div>
  )
}
