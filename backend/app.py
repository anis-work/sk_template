import asyncio
import os
import re
import traceback
import urllib.request
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import semantic_kernel as sk
from semantic_kernel.connectors.ai.google.google_ai.services.google_ai_chat_completion import GoogleAIChatCompletion

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))
if not os.getenv("GOOGLE_API_KEY"):
    load_dotenv(os.path.join(BASE_DIR, "plugins", "Teaching", ".env"))

MODEL_ID = "gemini-2.5-flash-lite"

app = FastAPI(title="Recipe Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "frontend")), name="static")

class RecipeRequest(BaseModel):
    dish: str
    format: str = "step-by-step"

@app.get("/")
def root():
    return FileResponse(os.path.join(BASE_DIR, "frontend", "index.html"))

def fetch_dish_image(dish: str) -> str:
    try:
        query = urllib.request.quote(f'{dish} food dish')
        url = f'https://www.bing.com/images/search?q={query}&form=HDRSC2&first=1'
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
        })
        html = urllib.request.urlopen(req, timeout=8).read().decode('utf-8', errors='ignore')
        matches = re.findall(r'murl&quot;:&quot;(https?://[^&"]+\.(?:jpg|jpeg|png|webp))', html)
        if not matches:
            matches = re.findall(r'"murl":"(https?://[^"]+\.(?:jpg|jpeg|png|webp))"', html)
        return matches[0] if matches else ""
    except Exception:
        return ""

@app.post("/generate")
async def generate_recipe(request: RecipeRequest):
    if not request.dish.strip():
        raise HTTPException(status_code=400, detail="Dish name cannot be empty.")
    try:
        kernel = sk.Kernel()
        kernel.add_service(GoogleAIChatCompletion(
            gemini_model_id=MODEL_ID,
            api_key=os.getenv("GOOGLE_API_KEY")
        ))
        plugin = kernel.add_plugin(parent_directory=os.path.join(BASE_DIR, "plugins"), plugin_name="Cooking")
        result = await kernel.invoke(plugin["RecipeGenerator"], input=request.dish, format=request.format)
        image_url = await asyncio.get_event_loop().run_in_executor(None, fetch_dish_image, request.dish)
        return {"recipe": str(result), "image_url": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=traceback.format_exc())
