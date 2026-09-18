const threshold = 0.6;

export const compareFaceEmbeddings = (registeredEmbedding, incomingEmbedding) => {

    if (
        !Array.isArray(registeredEmbedding) ||
        !Array.isArray(incomingEmbedding)
    ) {
        throw new Error("Embedding should be an array");
    }

    if (
        registeredEmbedding.length !== 128 ||
        incomingEmbedding.length !== 128
    ) {
        throw new Error("Embedding should be of length 128");
    }

    let sum = 0;

    for (let i = 0; i < 128; i++) {
        const difference =
            registeredEmbedding[i] - incomingEmbedding[i];

        sum += difference * difference;
    }

    const distance = Math.sqrt(sum);

    return {
        matched: distance <= threshold,
        distance
    };
};