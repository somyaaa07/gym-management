import * as faceApi from 'face-api.js';

export const loadFaceModels = async()=>{
    await faceApi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceApi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceApi.nets.faceRecognitionNet.loadFromUri('/models');

    console.log('face models are loaded successfully')
}