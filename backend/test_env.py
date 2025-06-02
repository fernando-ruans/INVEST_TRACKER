from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv('FINNHUB_API_KEY')
print(f"API Key loaded: {bool(api_key)}")
if api_key:
    print(f"API Key (first 10 chars): {api_key[:10]}...")
else:
    print("API Key not found")