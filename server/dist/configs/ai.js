import { InferenceClient } from "@huggingface/inference";
const ai = new InferenceClient(process.env.HUGGINGFACE_API_KEY);
export default ai;
