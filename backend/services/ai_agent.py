import os
import json
import time
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# ── Circuit Breaker ──────────────────────────────────────────
# After 3 consecutive failures, skip Groq for 5 minutes
_groq_fail_count = 0
_groq_circuit_open_until = 0
_GROQ_MAX_FAILURES = 3
_GROQ_COOLDOWN_SECONDS = 300  # 5 minutes


def generate_insight(ticker: str, indicators: dict, news: list) -> dict:
    """
    Uses the Groq API to generate a human-readable investment insight.
    Falls back to a local rule-based engine when Groq is unreachable.
    """
    global _groq_fail_count, _groq_circuit_open_until

    # Check circuit breaker
    if not GROQ_API_KEY:
        return _fallback_insight(ticker, indicators, news)

    if _groq_fail_count >= _GROQ_MAX_FAILURES:
        if time.time() < _groq_circuit_open_until:
            # Circuit is open — skip silently
            return _fallback_insight(ticker, indicators, news)
        else:
            # Cooldown expired — allow one retry
            print("[Groq] Circuit breaker reset — retrying API...")
            _groq_fail_count = 0

    # Build context for the AI
    signals_text = ""
    for sig in indicators.get("signals", []):
        signals_text += f"- {sig['type']}: value={sig['value']}, direction={sig['direction']}, strength={sig['strength']}\n"

    news_text = ""
    for article in news[:3]:
        title = article.get("title", article.get("content", {}).get("title", "N/A")) if isinstance(article, dict) else str(article)
        news_text += f"- {title}\n"

    prompt = f"""You are a senior quantitative financial analyst. Analyze the following data for {ticker} and provide a concise, actionable trading insight.

CURRENT PRICE: ${indicators.get('latest_price', 'N/A')}
RSI (14): {indicators.get('rsi', 'N/A')}
MACD: {indicators.get('macd', 'N/A')}
Volume Ratio (vs 20-day avg): {indicators.get('volume_ratio', 'N/A')}x
Overall Technical Bias: {indicators.get('overall_bias', 'N/A')}

DETECTED SIGNALS:
{signals_text if signals_text else "No strong signals detected."}

RECENT NEWS:
{news_text if news_text else "No recent news available."}

Provide your response in the following JSON format:
{{
    "summary": "A 1-2 sentence executive summary of the opportunity or risk",
    "action": "BUY" or "SELL" or "HOLD" or "WATCH",
    "confidence": a number from 0-100 representing your confidence,
    "reasoning": "2-3 sentences explaining the technical and fundamental reasoning",
    "risk_factors": "1-2 sentences on key risks to watch",
    "time_horizon": "SHORT_TERM" or "MEDIUM_TERM" or "LONG_TERM"
}}

Return ONLY valid JSON, no markdown formatting."""

    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {GROQ_API_KEY}",
        }
        payload = {
            "model": "llama3-70b-8192",
            "messages": [
                {"role": "system", "content": "You are a senior quantitative financial analyst. Always respond with valid JSON only."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.3,
            "max_tokens": 500,
        }

        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        
        result = response.json()
        content = result["choices"][0]["message"]["content"]
        
        # Parse the JSON response
        content = content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
        
        insight = json.loads(content)
        # Success — reset circuit breaker
        _groq_fail_count = 0
        print(f"[Groq] ✓ Live insight generated for {ticker}")
        return insight

    except Exception as e:
        _groq_fail_count += 1
        if _groq_fail_count >= _GROQ_MAX_FAILURES:
            _groq_circuit_open_until = time.time() + _GROQ_COOLDOWN_SECONDS
            print(f"[Groq] ✗ {_groq_fail_count} consecutive failures — circuit OPEN for 5 min. Using local fallback.")
        else:
            print(f"[Groq] ✗ Attempt {_groq_fail_count}/{_GROQ_MAX_FAILURES} failed: {type(e).__name__}")
        return _fallback_insight(ticker, indicators, news)


def _fallback_insight(ticker: str, indicators: dict, news: list) -> dict:
    """
    Generates a rule-based fallback insight when the Grok API is unavailable.
    """
    signals = indicators.get("signals", [])
    bias = indicators.get("overall_bias", "NEUTRAL")
    rsi = indicators.get("rsi", 50)
    price = indicators.get("latest_price", 0)

    # Determine action
    bullish_signals = [s for s in signals if s['direction'] == 'BULLISH']
    bearish_signals = [s for s in signals if s['direction'] == 'BEARISH']
    strong_signals = [s for s in signals if s['strength'] == 'STRONG']

    if len(bullish_signals) >= 2 and len(strong_signals) >= 1:
        action = "BUY"
        confidence = min(75, 50 + len(bullish_signals) * 10)
    elif len(bearish_signals) >= 2 and len(strong_signals) >= 1:
        action = "SELL"
        confidence = min(75, 50 + len(bearish_signals) * 10)
    elif len(bullish_signals) >= 1:
        action = "WATCH"
        confidence = 40 + len(bullish_signals) * 5
    elif len(bearish_signals) >= 1:
        action = "HOLD"
        confidence = 40 + len(bearish_signals) * 5
    else:
        action = "HOLD"
        confidence = 35

    # Build reasoning
    signal_names = [s['type'].replace('_', ' ').title() for s in signals[:3]]
    reasoning = f"{ticker} is showing a {bias.lower()} technical bias at ${price}."
    if signal_names:
        reasoning += f" Key signals: {', '.join(signal_names)}."
    if rsi and rsi < 35:
        reasoning += f" RSI at {rsi} suggests the stock is approaching oversold territory."
    elif rsi and rsi > 65:
        reasoning += f" RSI at {rsi} suggests the stock is approaching overbought territory."

    summary = f"{ticker} shows {bias.lower()} momentum with {len(signals)} active technical signal(s)."

    return {
        "summary": summary,
        "action": action,
        "confidence": confidence,
        "reasoning": reasoning,
        "risk_factors": "Market volatility and unexpected news events could override technical signals. Always use stop-losses.",
        "time_horizon": "SHORT_TERM" if any(s['type'].startswith('RSI') for s in signals) else "MEDIUM_TERM",
    }
