import React, { useEffect } from "react";
import { loadFaceModels } from "./services/faceApi.services";
import FaceCamera from "./components/FaceCamera";

export default function FaceTest() {
    
    useEffect(() => {
        loadFaceModels();
    }, []);

    return (
        <div>
           <FaceCamera />
        </div>
    );
}