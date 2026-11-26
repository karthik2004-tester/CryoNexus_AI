from pathlib import Path
from threading import Lock

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


BASE_DIR = Path(__file__).resolve().parent.parent
KNOWLEDGE_DIR = BASE_DIR / "app" / "knowledge_base"
EMBEDDING_MODEL_PATH = (
    BASE_DIR / "models" / "embedding" / "all-MiniLM-L6-v2"
)

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 150
DEFAULT_TOP_K = 3

_model = None
_index = None
_chunks = []

_model_lock = Lock()
_index_lock = Lock()


def get_embedding_model():
    global _model

    if _model is None:
        with _model_lock:
            if _model is None:
                if not EMBEDDING_MODEL_PATH.exists():
                    raise FileNotFoundError(
                        f"Embedding model not found: {EMBEDDING_MODEL_PATH}"
                    )

                _model = SentenceTransformer(
                    str(EMBEDDING_MODEL_PATH),
                    local_files_only=True,
                )

    return _model


def split_text(text):
    paragraphs = [
        paragraph.strip()
        for paragraph in text.split("\n")
        if paragraph.strip()
    ]

    chunks = []
    current = ""

    for paragraph in paragraphs:
        while len(paragraph) > CHUNK_SIZE:
            if current:
                chunks.append(current)
                current = ""

            chunks.append(paragraph[:CHUNK_SIZE])
            paragraph = paragraph[CHUNK_SIZE - CHUNK_OVERLAP:]

        if not paragraph:
            continue

        if len(current) + len(paragraph) + 2 <= CHUNK_SIZE:
            current = f"{current}\n{paragraph}".strip()
        else:
            if current:
                chunks.append(current)

            overlap = current[-CHUNK_OVERLAP:] if current else ""
            current = f"{overlap}\n{paragraph}".strip()

    if current:
        chunks.append(current)

    return chunks


def load_documents():
    documents = []

    if not KNOWLEDGE_DIR.exists():
        return documents

    for file_path in KNOWLEDGE_DIR.rglob("*"):
        if file_path.suffix.lower() not in {".txt", ".md"}:
            continue

        try:
            text = file_path.read_text(encoding="utf-8-sig")
        except (OSError, UnicodeError):
            continue

        for chunk in split_text(text):
            documents.append({
                "source": file_path.name,
                "content": chunk,
            })

    return documents


def build_knowledge_index():
    global _index, _chunks

    if _index is not None:
        return

    with _index_lock:
        if _index is not None:
            return

        documents = load_documents()

        if not documents:
            raise ValueError(
                "No readable knowledge documents found."
            )

        model = get_embedding_model()

        texts = [item["content"] for item in documents]

        embeddings = model.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False,
        )

        embeddings = np.asarray(embeddings, dtype=np.float32)

        index = faiss.IndexFlatIP(embeddings.shape[1])
        index.add(embeddings)

        _chunks = documents
        _index = index


def search_knowledge(query: str, top_k: int = DEFAULT_TOP_K):
    if not isinstance(query, str) or not query.strip():
        raise ValueError("Search query cannot be empty.")

    top_k = max(1, min(int(top_k), 10))

    build_knowledge_index()

    model = get_embedding_model()

    query_embedding = model.encode(
        [query.strip()],
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False,
    )

    query_embedding = np.asarray(
        query_embedding,
        dtype=np.float32,
    )

    scores, indices = _index.search(
        query_embedding,
        min(top_k, len(_chunks)),
    )

    results = []

    for score, index_position in zip(scores[0], indices[0]):
        if index_position < 0:
            continue

        item = _chunks[int(index_position)]

        results.append({
            "source": item["source"],
            "content": item["content"],
            "score": float(score),
        })

    return results
