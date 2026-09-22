import 'dotenv/config';
import { chatJson } from './src/services/ollama.service.js';

const r = await chatJson({
    model: 'llama',
    system: 'You are a helpful assistant. Reply with JSON only.',
    user: 'Reply with JSON: {"tip": "<one gym tip>"}',
});
console.log(r);