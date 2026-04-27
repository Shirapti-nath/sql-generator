import json
import chromadb
from chromadb.utils import embedding_functions
from pathlib import Path
from typing import List


class ProductRetriever:
    COLLECTION_NAME = "mumzworld_products"

    def __init__(self):
        self.client = chromadb.Client()
        self.ef = embedding_functions.DefaultEmbeddingFunction()
        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            embedding_function=self.ef,
            metadata={"hnsw:space": "cosine"},
        )

    def load_catalogue(self, path: str):
        catalogue_path = Path(path)
        if not catalogue_path.exists():
            raise FileNotFoundError(f"Catalogue not found at {path}")

        with open(catalogue_path) as f:
            products = json.load(f)

        existing_ids = set(self.collection.get()["ids"])

        to_add_ids, to_add_docs, to_add_metas = [], [], []

        for p in products:
            if p["id"] in existing_ids:
                continue

            searchable_text = (
                f"{p['name']}. {p['description']} "
                f"Age range: {p['age_min_months']} to {p['age_max_months']} months. "
                f"Tags: {', '.join(p['tags'])}. "
                f"Why great: {p['why_great']}"
            )

            to_add_ids.append(p["id"])
            to_add_docs.append(searchable_text)
            to_add_metas.append({
                "id": p["id"],
                "name": p["name"],
                "category": p["category"],
                "brand": p["brand"],
                "price": p["price"],
                "currency": p["currency"],
                "age_min_months": p["age_min_months"],
                "age_max_months": p["age_max_months"],
                "safety_notes": p["safety_notes"],
                "why_great": p["why_great"],
                "link": p["link"],
                "rating": p["rating"],
                "tags": ", ".join(p["tags"]),
            })

        if to_add_ids:
            self.collection.add(
                ids=to_add_ids,
                documents=to_add_docs,
                metadatas=to_add_metas,
            )

    def search(self, query: str, n_results: int = 5) -> List[dict]:
        results = self.collection.query(
            query_texts=[query],
            n_results=min(n_results, self.collection.count()),
        )

        products = []
        if results and results["metadatas"]:
            for meta, distance in zip(
                results["metadatas"][0], results["distances"][0]
            ):
                products.append({**meta, "similarity_score": round(1 - distance, 3)})

        return products

    def count(self) -> int:
        return self.collection.count()
