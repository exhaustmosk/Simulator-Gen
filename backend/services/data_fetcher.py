import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import zlib

def fetch_stock_data(ticker: str, period: str = "3mo", interval: str = "1d") -> pd.DataFrame:
    """
    Returns dummy OHLCV data for prototyping explicitly requested by user to bypass curl errors.
    Creates a deterministic random walk based on the ticker name.
    """
    try:
        period_map = {"1mo": 30, "3mo": 90, "6mo": 180, "1y": 365}
        days = period_map.get(period, 90)
        dates = [datetime.now() - timedelta(days=i) for i in range(days)]
        dates.reverse()
        
        # Deterministic seed based on ticker
        seed = zlib.adler32(ticker.encode('utf-8'))
        np.random.seed(seed)
        
        # Base price based on ticker
        base_price = 50 + (seed % 400)
        
        # Random walk
        returns = np.random.normal(0.0005, 0.02, days)
        price_path = base_price * np.exp(np.cumsum(returns))
        
        df = pd.DataFrame({
            'Date': [d.strftime('%Y-%m-%d') for d in dates],
            'Open': price_path * np.random.uniform(0.99, 1.01, days),
            'High': price_path * np.random.uniform(1.0, 1.03, days),
            'Low': price_path * np.random.uniform(0.97, 1.0, days),
            'Close': price_path,
            'Volume': np.random.randint(1000000, 50000000, days)
        })
        return df
    except Exception as e:
        print(f"Error generating dummy data for {ticker}: {e}")
        return pd.DataFrame()

def fetch_stock_news(ticker: str) -> list:
    """
    Returns high-quality dummy news items for prototyping.
    """
    return [
        {"title": f"{ticker} announces major structural reorganization focusing on AI inference scaling.", "link": "#", "publisher": "Bloomberg"},
        {"title": f"Institutional confidence in {ticker} hits all-time highs ahead of earnings cycle.", "link": "#", "publisher": "Reuters"},
        {"title": f"{ticker} board authorizes $5B share repurchase program.", "link": "#", "publisher": "WSJ"},
        {"title": f"Volatility spikes on {ticker} options chain as retail sentiment shifts heavily.", "link": "#", "publisher": "CNBC"},
    ]
