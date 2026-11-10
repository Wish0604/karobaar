from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Literal, Dict, Any

app = FastAPI(title="LocalAI Intelligence Service", version="0.1.0")


class AssistantMessage(BaseModel):
    role: Literal["merchant", "customer"]
    message: str = Field(min_length=2)
    language: str = "en"


class ToolCall(BaseModel):
    tool: str
    arguments: Dict[str, Any]


@app.get("/health")
def health() -> Dict[str, Any]:
    return {"success": True, "data": {"service": "localai-ai-service", "status": "ok"}}


@app.post("/v1/assistant/message")
def assistant_message(payload: AssistantMessage) -> Dict[str, Any]:
    if payload.role == "merchant":
        response = (
            "I can analyze your sales trend, identify low-stock products, "
            "and generate a campaign draft for approval."
        )
        tool_hints = [
            ToolCall(tool="get_merchant_sales", arguments={"period": "this_month"}),
            ToolCall(tool="get_inventory", arguments={"onlyLowStock": True}),
        ]
    else:
        response = (
            "I can find nearby products, compare options by price and distance, "
            "and help reserve items."
        )
        tool_hints = [
            ToolCall(tool="search_nearby_products", arguments={"radiusKm": 2}),
            ToolCall(tool="compare_prices", arguments={}),
        ]

    return {
        "success": True,
        "data": {
            "response": f"{response} You asked: {payload.message}",
            "toolHints": [hint.model_dump() for hint in tool_hints],
            "executionPolicy": "llm_interprets_backend_executes"
        },
    }


@app.post("/v1/recommendations/growth")
def growth_recommendations() -> Dict[str, Any]:
    # Deterministic placeholder logic for hackathon demo.
    recommendations = [
        {
            "type": "inventory_opportunity",
            "priority": "high",
            "message": "Top-selling SKU may stock out tomorrow. Suggested restock: 25 units.",
            "evidence": ["last_7_day_velocity", "current_available_stock", "upcoming_reservations"],
        },
        {
            "type": "sales_opportunity",
            "priority": "medium",
            "message": "Weekend beverage demand is trending up. Launch a 2-day combo offer.",
            "evidence": ["local_search_trend", "weekend_sales_pattern"],
        },
    ]
    return {"success": True, "data": recommendations}
