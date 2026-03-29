import pandas as pd
import numpy as np
from ta.momentum import RSIIndicator
from ta.trend import MACD, EMAIndicator
from ta.volatility import BollingerBands
from ta.volume import VolumeWeightedAveragePrice


def compute_indicators(df: pd.DataFrame) -> dict:
    """
    Compute technical indicators on a stock DataFrame.
    Returns a dictionary with the latest indicator values and signal flags.
    """
    if df.empty or len(df) < 20:
        return {"error": "Insufficient data for analysis"}

    close = df['Close']
    high = df['High']
    low = df['Low']
    volume = df['Volume']

    rsi_indicator = RSIIndicator(close=close, window=14)
    df['RSI'] = rsi_indicator.rsi()

    macd_indicator = MACD(close=close)
    df['MACD'] = macd_indicator.macd()
    df['MACD_Signal'] = macd_indicator.macd_signal()
    df['MACD_Histogram'] = macd_indicator.macd_diff()

    bb_indicator = BollingerBands(close=close, window=20, window_dev=2)
    df['BB_Upper'] = bb_indicator.bollinger_hband()
    df['BB_Lower'] = bb_indicator.bollinger_lband()
    df['BB_Middle'] = bb_indicator.bollinger_mavg()

    ema_20 = EMAIndicator(close=close, window=20)
    ema_50 = EMAIndicator(close=close, window=50)
    df['EMA_20'] = ema_20.ema_indicator()
    df['EMA_50'] = ema_50.ema_indicator()

    avg_volume = volume.rolling(window=20).mean()
    df['Volume_Ratio'] = volume / avg_volume

    latest = df.iloc[-1]
    prev = df.iloc[-2] if len(df) > 1 else latest

    signals = []

    rsi_val = latest.get('RSI', 50)
    if not pd.isna(rsi_val):
        if rsi_val < 30:
            signals.append({"type": "RSI_OVERSOLD", "value": round(rsi_val, 2), "direction": "BULLISH", "strength": "STRONG"})
        elif rsi_val > 70:
            signals.append({"type": "RSI_OVERBOUGHT", "value": round(rsi_val, 2), "direction": "BEARISH", "strength": "STRONG"})
        elif rsi_val < 40:
            signals.append({"type": "RSI_LEANING_OVERSOLD", "value": round(rsi_val, 2), "direction": "BULLISH", "strength": "MODERATE"})
        elif rsi_val > 60:
            signals.append({"type": "RSI_LEANING_OVERBOUGHT", "value": round(rsi_val, 2), "direction": "BEARISH", "strength": "MODERATE"})

    # MACD crossover
    macd_val = latest.get('MACD', 0)
    macd_sig = latest.get('MACD_Signal', 0)
    prev_macd = prev.get('MACD', 0)
    prev_sig = prev.get('MACD_Signal', 0)
    if not pd.isna(macd_val) and not pd.isna(macd_sig):
        if prev_macd <= prev_sig and macd_val > macd_sig:
            signals.append({"type": "MACD_BULLISH_CROSSOVER", "value": round(macd_val, 4), "direction": "BULLISH", "strength": "STRONG"})
        elif prev_macd >= prev_sig and macd_val < macd_sig:
            signals.append({"type": "MACD_BEARISH_CROSSOVER", "value": round(macd_val, 4), "direction": "BEARISH", "strength": "STRONG"})

    # Bollinger Band breakout
    bb_upper = latest.get('BB_Upper', 0)
    bb_lower = latest.get('BB_Lower', 0)
    close_val = latest['Close']
    if not pd.isna(bb_upper) and not pd.isna(bb_lower):
        if close_val > bb_upper:
            signals.append({"type": "BB_UPPER_BREAKOUT", "value": round(close_val, 2), "direction": "BEARISH", "strength": "MODERATE"})
        elif close_val < bb_lower:
            signals.append({"type": "BB_LOWER_BREAKOUT", "value": round(close_val, 2), "direction": "BULLISH", "strength": "MODERATE"})

    # Volume spike
    vol_ratio = latest.get('Volume_Ratio', 1)
    if not pd.isna(vol_ratio) and vol_ratio > 2.0:
        signals.append({"type": "VOLUME_SPIKE", "value": round(vol_ratio, 2), "direction": "NEUTRAL", "strength": "STRONG"})

    # EMA crossover
    ema20 = latest.get('EMA_20', 0)
    ema50 = latest.get('EMA_50', 0)
    prev_ema20 = prev.get('EMA_20', 0)
    prev_ema50 = prev.get('EMA_50', 0)
    if not pd.isna(ema20) and not pd.isna(ema50):
        if prev_ema20 <= prev_ema50 and ema20 > ema50:
            signals.append({"type": "EMA_GOLDEN_CROSS", "value": round(ema20, 2), "direction": "BULLISH", "strength": "STRONG"})
        elif prev_ema20 >= prev_ema50 and ema20 < ema50:
            signals.append({"type": "EMA_DEATH_CROSS", "value": round(ema20, 2), "direction": "BEARISH", "strength": "STRONG"})

    bullish_count = sum(1 for s in signals if s['direction'] == 'BULLISH')
    bearish_count = sum(1 for s in signals if s['direction'] == 'BEARISH')
    if bullish_count > bearish_count:
        overall_bias = "BULLISH"
    elif bearish_count > bullish_count:
        overall_bias = "BEARISH"
    else:
        overall_bias = "NEUTRAL"

    chart_data = []
    for _, row in df.iterrows():
        date_key = row.get('Date', row.get('Datetime', ''))
        entry = {
            "date": str(date_key),
            "close": round(row['Close'], 2) if not pd.isna(row['Close']) else None,
            "open": round(row['Open'], 2) if not pd.isna(row['Open']) else None,
            "high": round(row['High'], 2) if not pd.isna(row['High']) else None,
            "low": round(row['Low'], 2) if not pd.isna(row['Low']) else None,
            "volume": int(row['Volume']) if not pd.isna(row['Volume']) else None,
        }
        if not pd.isna(row.get('RSI', float('nan'))):
            entry['rsi'] = round(row['RSI'], 2)
        if not pd.isna(row.get('EMA_20', float('nan'))):
            entry['ema20'] = round(row['EMA_20'], 2)
        if not pd.isna(row.get('EMA_50', float('nan'))):
            entry['ema50'] = round(row['EMA_50'], 2)
        if not pd.isna(row.get('BB_Upper', float('nan'))):
            entry['bbUpper'] = round(row['BB_Upper'], 2)
            entry['bbLower'] = round(row['BB_Lower'], 2)
        chart_data.append(entry)

    return {
        "latest_price": round(close_val, 2),
        "rsi": round(rsi_val, 2) if not pd.isna(rsi_val) else None,
        "macd": round(macd_val, 4) if not pd.isna(macd_val) else None,
        "volume_ratio": round(vol_ratio, 2) if not pd.isna(vol_ratio) else None,
        "signals": signals,
        "overall_bias": overall_bias,
        "chart_data": chart_data,
    }


def simple_backtest(df: pd.DataFrame, signal_type: str) -> dict:
    """
    Lightweight backtest: checks how a signal performed historically
    by looking at forward returns after similar patterns.
    """
    if df.empty or len(df) < 30:
        return {"win_rate": None, "avg_return": None, "sample_size": 0}

    close = df['Close'].values
    results = []

    rsi_indicator = RSIIndicator(close=df['Close'], window=14)
    rsi_values = rsi_indicator.rsi().values

    for i in range(20, len(df) - 5):
        triggered = False
        if signal_type == "RSI_OVERSOLD" and not np.isnan(rsi_values[i]) and rsi_values[i] < 30:
            triggered = True
        elif signal_type == "RSI_OVERBOUGHT" and not np.isnan(rsi_values[i]) and rsi_values[i] > 70:
            triggered = True
        elif signal_type == "VOLUME_SPIKE":
            avg_vol = np.mean(df['Volume'].values[max(0, i-20):i])
            if avg_vol > 0 and df['Volume'].values[i] / avg_vol > 2.0:
                triggered = True

        if triggered:
            entry_price = close[i]
            exit_price = close[min(i + 5, len(close) - 1)]
            ret = (exit_price - entry_price) / entry_price * 100
            if signal_type in ["RSI_OVERBOUGHT"]:
                results.append(-ret)  # Short bias
            else:
                results.append(ret)

    if not results:
        return {"win_rate": None, "avg_return": None, "sample_size": 0}

    wins = sum(1 for r in results if r > 0)
    return {
        "win_rate": round(wins / len(results) * 100, 1),
        "avg_return": round(np.mean(results), 2),
        "sample_size": len(results),
    }
