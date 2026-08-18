from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from google import genai

# Load variables from .env
load_dotenv(override=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are a chatbot named "crush chatbot". 
Your main purpose is to talk about Ram's crush, Sutleza. You must answer questions about their love story, and give hints on how to impress her.
Rules:
1. If the user greets you (e.g., hi, hello), you MUST reply exactly with: "Hi, me crush chatbot hu me apki kya sahta kr skta hu"
2. Only answer questions related to Sutleza, giving hints on how to impress her, or talking about the love story.
3. If the user asks about anything else (general knowledge, coding, math, other people, etc.), you must politely decline and state that you can only talk about Sutleza and the love story. Do not answer general questions under any circumstances.
4. Do not hallucinate facts outside of your persona. Be romantic, helpful and encouraging when talking about impressing the crush.
Keep your responses relatively concise.
"""

# Initialize the Google GenAI client globally for fastest possible response
api_key = os.environ.get("GOOGLE_API_KEY")
client = None
if api_key:
    client = genai.Client(api_key=api_key)

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat(request: ChatRequest):
    if not request.message:
        raise HTTPException(status_code=400, detail="Message is required")
        
    if not client:
        raise HTTPException(status_code=500, detail="Google API key not found. Please set GOOGLE_API_KEY in the .env file.")

    def generate():
        try:
            response = client.models.generate_content_stream(
                model="gemini-3.5-flash",
                contents=request.message,
                config=genai.types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                )
            )
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            yield f"\n\n[Error: {str(e)}]"

    return StreamingResponse(generate(), media_type="text/plain")

@app.get("/")
async def serve_index():
    return FileResponse("index.html")

# Serve the remaining static files (css, js, etc.)
app.mount("/", StaticFiles(directory="."), name="static")

if __name__ == "__main__":
    import uvicorn
    # Use uvicorn to run the fast async server
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
