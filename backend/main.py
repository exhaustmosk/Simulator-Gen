from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from services.data_fetcher import fetch_stock_data, fetch_stock_news
from services.technical_analysis import compute_indicators, simple_backtest
from services.ai_agent import generate_insight
import uvicorn

app = FastAPI(title="Market Intelligence Engine", version="1.0.0")

# Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default watchlist
DEFAULT_TICKERS = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "AMZN", "META", "AMD", "NFLX", "JPM"]


@app.get("/")
def root():
    return {"status": "ok", "message": "Market Intelligence Engine is running"}

# Basic mock DB for hackathon
MOCK_USERS = {}

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

@app.post("/api/auth/register")
async def register(user: UserRegister):
    await asyncio.sleep(0.5) # Simulate network latency
    if user.email in MOCK_USERS:
        raise HTTPException(status_code=400, detail="Email already registered")
    MOCK_USERS[user.email] = {"name": user.name, "password": user.password}
    return {"token": f"mock-token-{user.email}", "user": {"name": user.name, "email": user.email}}

@app.post("/api/auth/login")
async def login(user: UserLogin):
    await asyncio.sleep(0.5)
    db_user = MOCK_USERS.get(user.email)
    
    # Auto-register mechanism for demo purposes if not found
    if not db_user:
        MOCK_USERS[user.email] = {"name": user.email.split('@')[0], "password": user.password}
        db_user = MOCK_USERS[user.email]
        
    if db_user["password"] != user.password:
        raise HTTPException(status_code=401, detail="Invalid password")
        
    return {"token": f"mock-token-{user.email}", "user": {"name": db_user["name"], "email": user.email}}


@app.get("/api/signals")
def get_all_signals():
    """
    Scans the default watchlist and returns detected signals for all tickers.
    """
    results = []
    for ticker in DEFAULT_TICKERS:
        try:
            df = fetch_stock_data(ticker, period="3mo", interval="1d")
            if df.empty:
                continue
            indicators = compute_indicators(df)
            if "error" in indicators:
                continue

            news = fetch_stock_news(ticker)
            insight = generate_insight(ticker, indicators, news)

            # Simple backtest on the first signal if available
            backtest_result = None
            if indicators.get("signals"):
                first_signal_type = indicators["signals"][0]["type"]
                hist_df = fetch_stock_data(ticker, period="1y", interval="1d")
                if not hist_df.empty:
                    backtest_result = simple_backtest(hist_df, first_signal_type)

            results.append({
                "ticker": ticker,
                "price": indicators["latest_price"],
                "rsi": indicators.get("rsi"),
                "macd": indicators.get("macd"),
                "volume_ratio": indicators.get("volume_ratio"),
                "overall_bias": indicators["overall_bias"],
                "signals": indicators["signals"],
                "insight": insight,
                "backtest": backtest_result,
            })
        except Exception as e:
            print(f"Error processing {ticker}: {e}")
            continue

    # Sort by number of signals (most interesting first)
    results.sort(key=lambda x: len(x["signals"]), reverse=True)
    return {"data": results, "count": len(results)}


@app.get("/api/ticker/{symbol}")
def get_ticker_detail(symbol: str, period: str = "3mo", interval: str = "1d"):
    """
    Get detailed analysis for a single ticker.
    """
    symbol = symbol.upper()
    df = fetch_stock_data(symbol, period=period, interval=interval)
    if df.empty:
        raise HTTPException(status_code=404, detail=f"No data found for {symbol}")

    indicators = compute_indicators(df)
    if "error" in indicators:
        raise HTTPException(status_code=400, detail=indicators["error"])

    news = fetch_stock_news(symbol)
    insight = generate_insight(symbol, indicators, news)

    # Backtest on each signal
    backtest_results = {}
    hist_df = fetch_stock_data(symbol, period="1y", interval="1d")
    if not hist_df.empty:
        for sig in indicators.get("signals", []):
            bt = simple_backtest(hist_df, sig["type"])
            backtest_results[sig["type"]] = bt

    # Format news for frontend
    formatted_news = []
    for article in news[:5]:
        if isinstance(article, dict):
            formatted_news.append({
                "title": article.get("title", article.get("content", {}).get("title", "N/A")),
                "link": article.get("link", article.get("content", {}).get("clickThroughUrl", {}).get("url", "#")),
                "publisher": article.get("publisher", article.get("content", {}).get("provider", {}).get("displayName", "Unknown")),
            })

    return {
        "ticker": symbol,
        "price": indicators["latest_price"],
        "rsi": indicators.get("rsi"),
        "macd": indicators.get("macd"),
        "volume_ratio": indicators.get("volume_ratio"),
        "overall_bias": indicators["overall_bias"],
        "signals": indicators["signals"],
        "chart_data": indicators["chart_data"],
        "insight": insight,
        "backtest": backtest_results,
        "news": formatted_news,
    }


@app.get("/api/news/{symbol}")
def get_ticker_news(symbol: str):
    """
    Get recent news for a ticker.
    """
    symbol = symbol.upper()
    news = fetch_stock_news(symbol)
    formatted_news = []
    for article in news[:10]:
        if isinstance(article, dict):
            formatted_news.append({
                "title": article.get("title", article.get("content", {}).get("title", "N/A")),
                "link": article.get("link", article.get("content", {}).get("clickThroughUrl", {}).get("url", "#")),
                "publisher": article.get("publisher", article.get("content", {}).get("provider", {}).get("displayName", "Unknown")),
            })
    return {"ticker": symbol, "news": formatted_news}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
