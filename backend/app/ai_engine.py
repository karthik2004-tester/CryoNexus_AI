from pathlib import Path
from threading import Lock

from llama_cpp import Llama
from app.rag_engine import search_knowledge


MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "models"
    / "qwen2.5-1.5b-instruct-q4_k_m.gguf"
)

_model = None
_model_lock = Lock()
_generation_lock = Lock()


SYSTEM_PROMPT = """
You are CryoNexus AI, an intelligent cold-chain logistics assistant.

Your responsibilities:
1. Explain cold-chain logistics and shipment conditions.
2. Help interpret temperature, battery, delay and shipment-risk information.
3. Explain possible operational actions and recovery options.
4. Assist drivers, operators, hub managers and administrators.
5. Provide concise, practical and understandable answers.

Important rules:
- Never invent shipment readings, sensor data or operational events.
- Do not claim that simulated telemetry is real IoT data.
- Do not invent company policies or regulatory requirements.
- Do not make unsupported food-safety or medical claims.
- Distinguish general guidance from verified shipment-specific information.
- If information is insufficient, clearly say what is missing.
- Recommend following validated product-specific SOPs for safety-critical decisions.
- Never claim to have performed an action in the system.

When reference context is supplied:
- Use it as supporting knowledge.
- Do not present general reference material as an official company SOP.
- Do not invent facts absent from the context.
- If the context does not answer the question, say so clearly.
"""


def get_model():
    global _model

    if _model is None:
        with _model_lock:
            if _model is None:
                if not MODEL_PATH.exists():
                    raise FileNotFoundError(
                        f"Local AI model not found: {MODEL_PATH}"
                    )

                _model = Llama(
                    model_path=str(MODEL_PATH),
                    n_ctx=2048,
                    n_threads=4,
                    n_batch=128,
                    verbose=False,
                )

    return _model


def generate_response(message: str, max_tokens: int = 256) -> str:
    if not isinstance(message, str) or not message.strip():
        raise ValueError("Message cannot be empty.")

    message = message.strip()

    if len(message) > 4000:
        raise ValueError("Message is too long. Maximum 4000 characters.")

    max_tokens = max(32, min(int(max_tokens), 512))

    # Retrieve relevant reference material.
    references = search_knowledge(message, top_k=3)

    if references:
        context_parts = []

        for number, reference in enumerate(references, start=1):
            context_parts.append(
                f"[Reference {number}: {reference['source']}]\n"
                f"{reference['content']}"
            )

        context = "\n\n".join(context_parts)

        user_prompt = (
            f"REFERENCE CONTEXT:\n{context}\n\n"
            f"USER QUESTION:\n{message}\n\n"
            "Answer the user's question using the reference context "
            "where relevant. Clearly distinguish general guidance "
            "from verified shipment-specific information."
        )

        source_names = list(dict.fromkeys(
            reference["source"] for reference in references
        ))
    else:
        user_prompt = message
        source_names = []

    with _generation_lock:
        model = get_model()

        result = model.create_chat_completion(
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            max_tokens=max_tokens,
            temperature=0.2,
        )

    response = result["choices"][0]["message"]["content"]

    response = response.strip() if response else (
        "I could not generate a response. Please try again."
    )

    if source_names:
        response += (
            "\n\nReference material used: "
            + ", ".join(source_names)
            + " (general educational guidance; not an official SOP)."
        )

    return response
