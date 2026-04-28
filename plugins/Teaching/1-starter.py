import asyncio
import os
from dotenv import load_dotenv
import semantic_kernel as sk
from semantic_kernel.connectors.ai.google.google_ai.services.google_ai_chat_completion import GoogleAIChatCompletion

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

MODEL_ID = "gemini-2.5-flash-lite"

async def main():
    kernel = sk.Kernel()
    kernel.add_service(GoogleAIChatCompletion(gemini_model_id=MODEL_ID, api_key=os.getenv("GOOGLE_API_KEY")))

    plugin = kernel.add_plugin(parent_directory="plugins", plugin_name="Cooking")
    result = await kernel.invoke(plugin["RecipeGenerator"], input="Pasta Alfredo", format="step-by-step")
    print(result)

asyncio.run(main())
