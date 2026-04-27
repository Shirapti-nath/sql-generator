import anthropic
import os
from typing import List


SYSTEM_PROMPT = """You are Mumzworld's expert parenting advisor. You have deep knowledge of child development stages (0–8 years).

Your role:
- Help parents find the right products for their child's exact age and stage
- ONLY recommend products from the catalogue provided in each conversation turn
- Always mention age/stage suitability for the recommended products
- Always include safety notes relevant to the age group
- Explain WHY each product fits the child's current developmental stage
- Be warm, reassuring, and specific — never vague
- If the parent's question is unclear, ask ONE clarifying question (e.g., child's age or specific challenge)
- Never invent products or links not in the provided catalogue

Response format:
1. Brief empathetic opening (1 sentence)
2. For each recommended product (up to 3):
   - **Product Name** — Price (AED)
   - Age suitability: [specific months/years]
   - Why this works for your baby right now: [developmental reason]
   - Safety note: [relevant safety tip]
   - [Shop on Mumzworld →](link)
3. A brief encouraging closing tip (1–2 sentences)

Keep your total response under 400 words."""


class ParentingAdvisor:
    def __init__(self):
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise EnvironmentError("ANTHROPIC_API_KEY environment variable is not set.")
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = "claude-sonnet-4-6"

    def _build_catalogue_context(self, products: List[dict]) -> str:
        if not products:
            return "No products found in the catalogue for this query."

        lines = ["Relevant products from the Mumzworld catalogue:\n"]
        for p in products:
            lines.append(
                f"- ID: {p['id']} | {p['name']} ({p['brand']}) | "
                f"AED {p['price']} | "
                f"Age: {p['age_min_months']}–{p['age_max_months']} months | "
                f"Category: {p['category']}\n"
                f"  Description: {p.get('description', '')}\n"
                f"  Why great: {p['why_great']}\n"
                f"  Safety: {p['safety_notes']}\n"
                f"  Link: {p['link']}\n"
            )
        return "\n".join(lines)

    def respond(
        self,
        user_message: str,
        products: List[dict],
        conversation_history: List[dict],
    ) -> str:
        catalogue_context = self._build_catalogue_context(products)

        messages = []

        for turn in conversation_history:
            if turn.get("role") in ("user", "assistant"):
                messages.append({"role": turn["role"], "content": turn["content"]})

        messages.append({
            "role": "user",
            "content": (
                f"{catalogue_context}\n\n"
                f"Parent's question: {user_message}"
            ),
        })

        response = self.client.messages.create(
            model=self.model,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=messages,
        )

        return response.content[0].text
