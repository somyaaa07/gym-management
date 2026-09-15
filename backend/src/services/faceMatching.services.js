import {comapreFaceEmbeddings} from './faceRecoginition.services.js'

export const findMatchingFace = async (faceEmbedding, faceEmbeddings) => {
    const MATCH_THRESHOLD = 0.5;
    const MIN_MARGIN = 0.08;

    let matchedFace = null;
     let bestDistance = Infinity;
    let secondBestDistance = Infinity;

        for (const faceRecord of registeredFaces) {
        let currentEmbedding = faceRecord.face_embedding;
        if (typeof currentEmbedding === "string") {
            currentEmbedding = JSON.parse(currentEmbedding);
        }

        const { distance } = comapreFaceEmbeddings(currentEmbedding, incomingEmbedding);

        if (distance < bestDistance) {
            secondBestDistance = bestDistance;
            bestDistance = distance;
            matchedFace = faceRecord;
        } else if (distance < secondBestDistance) {
            secondBestDistance = distance;
        }
    }
     const isAmbiguous = (secondBestDistance - bestDistance) < MIN_MARGIN;
    const isMatch = matchedFace && bestDistance <= MATCH_THRESHOLD && !isAmbiguous;

    return { matchedFace, bestDistance, isAmbiguous, isMatch };
}