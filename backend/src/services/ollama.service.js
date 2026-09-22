import process from 'process';


const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_LLAMA_MODEL = process.env.OLLAMA_LLAMA_MODEL || 'llama3.2:3b';
const OLLAMA_GEMMA_MODEL = process.env.OLLAMA_GEMMA_MODEL || 'gemma3:1b';
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 180000);


export class OllamaError extends Error {
    constructor(message, statusCode = 502, code = "OLLAMA_ERROR") {
        super(message);
        this.name = "OllamaError"
        this.code = code;
        this.statusCode = statusCode;
    }
}


const MODEL_KEYS = ["llama", "gemma"]

function resolveModel(key) {
    if (key === 'llama') {
        return OLLAMA_LLAMA_MODEL
    }

    if (key === 'gemma') {
        return OLLAMA_GEMMA_MODEL
    }

    throw new OllamaError(
        `Unsupported key found : ${key}`,
        400,
        "INVALID_MODEL"
    );
}


async function listModels() {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);

    if (!response.ok) {
        throw new OllamaError(
            `Ollama returned HTTP ${response.status}`,
            502,
            "OLLAMA_HTTP_ERROR"
        )
    }

    const data = await response.json();

    const installed = new Set(
        (data.models || []).map((model) => model.name)
    );
    const llamaModel = OLLAMA_LLAMA_MODEL;
    const gemmaModel = OLLAMA_GEMMA_MODEL;


    return {
        llama: {
            model: llamaModel,
            installed: installed.has(llamaModel)
        },
        gemma: {
            model: gemmaModel,
            installed: installed.has(gemmaModel)
        }
    }
}


async function chatJson({
    model,
    system,
    user,
    jsonSchema,
    signal
}) {
    const modelName = resolveModel(model);

    const controller = new AbortController();
    let timedOut = false;

    const timeout = setTimeout(
        () => {

            timedOut = true;
            controller.abort();
        },

        OLLAMA_TIMEOUT_MS

    )


    try {


        if (signal) {
            signal.addEventListener("abort",
                () => controller.abort(),
                {
                    once: true
                }
            );
        }
        const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            signal: controller.signal,
            body: JSON.stringify({
                model: modelName,
                messages: [
                    {
                        role: "system",
                        content: system
                    },
                    {
                        role: "user",
                        content: user
                    }
                ],
                stream: false,
                format: jsonSchema || "json",

            })
        });
        if (!response.ok) {
            throw new OllamaError(
                `Ollama returned HTTP ${response.status}`,
                502,
                "OLLAMA_HTTP_ERROR"
            );
        }

        const data = await response.json();

        const content = data?.message?.content;
        if (!content) {
            throw new OllamaError(
                "Ollama returned an empty response",
                502,
                "OLLAMA_EMPTY_RESPONSE"
            );
        }

        let parsed;
        try {
            parsed = JSON.parse(content);
        }

        catch {
            throw new OllamaError(
                "Ollama returned invalid JSON",
                502,
                "OLLAMA_INVALID_JSON"
            );
        }

        return parsed;

    } catch (error) {
        if (error instanceof OllamaError) {
            throw error;
        }
        if (error?.name === "AbortError") {
            if (timedOut) {
                throw new OllamaError(
                    "Ollama request timed out",
                    504,
                    "OLLAMA_TIMEOUT"
                );
            }

            throw new OllamaError(
                "Ollama request was cancelled",
                499,
                "OLLAMA_CANCELLED"
            );
        }


        throw new OllamaError(
            "unable to connect with ollama",
            502,
            "OLLAMA_UNREACHABLE"
        )

    }

    finally {
        clearTimeout(timeout);
    }



}



export {
    MODEL_KEYS,
    resolveModel,
    listModels,
    chatJson
};