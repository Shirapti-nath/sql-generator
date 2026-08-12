from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from retriever import ProductRetriever
from advisor import ParentingAdvisor
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Mumzworld AI Parenting Advisor", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

retriever = ProductRetriever()
advisor = ParentingAdvisor()


class ChatRequest(BaseModel):
    message: str
    conversation_history: list[dict] = []


class ChatResponse(BaseModel):
    reply: str
    products_retrieved: int


@app.on_event("startup")
async def startup():
    logger.info("Loading product catalogue into vector store...")
    retriever.load_catalogue("../data/products.json")
    logger.info("Ready.")


@app.get("/health")
def health():
    return {"status": "ok", "catalogue_size": retriever.count()}


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    products = retriever.search(req.message, n_results=5)
    logger.info(f"Retrieved {len(products)} products for query: {req.message!r}")

    reply = advisor.respond(
        user_message=req.message,
        products=products,
        conversation_history=req.conversation_history,
    )

    return ChatResponse(reply=reply, products_retrieved=len(products))
