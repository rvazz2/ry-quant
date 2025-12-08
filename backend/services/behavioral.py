import yfinance as yf
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import feedparser
import random
import urllib.parse
from datetime import datetime, timedelta

analyzer = SentimentIntensityAnalyzer()

def fetch_google_news_rss(ticker: str):
    """
    Fetches news from Google News RSS as a fallback.
    """
    encoded_query = urllib.parse.quote(f"{ticker} stock news")
    rss_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-US&gl=US&ceid=US:en"
    feed = feedparser.parse(rss_url, agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    
    
    news_items = []
    for entry in feed.entries[:10]:
        news_items.append({
            "title": entry.title,
            "link": entry.link,
            "published": entry.published
        })
    return news_items

from cache import timed_cache

@timed_cache(seconds=300)
def get_sentiment_analysis(ticker: str):
    """
    Analyzes news headlines for a ticker using VADER.
    Returns a sentiment score (-1 to 1) and 'Fear/Greed' label.
    """
    try:
        # 1. Try Yahoo Finance first
        t = yf.Ticker(ticker)
        news = t.news
        
        headlines = []
        
        # Parse Yahoo News
        if news:
            for item in news:
                headlines.append({
                    "title": item.get('title', ''),
                    "link": item.get('link', '#')
                })
        
        # 2. Fallback to Google News RSS if Yahoo fails
        if not headlines:
            print(f"Yahoo Finance returned no news for {ticker}. Switching to Google News RSS...")
            google_news = fetch_google_news_rss(ticker)
            for item in google_news:
                headlines.append({
                    "title": item['title'],
                    "link": item['link']
                })

        if not headlines:
             return {"error": "No news found", "score": 0, "label": "Neutral", "headlines": []}

        # 3. Analyze Sentiment with VADER
        total_compound = 0
        count = 0
        analyzed_headlines = []
        
        for item in headlines:
            title = item['title']
            if title:
                scores = analyzer.polarity_scores(title)
                compound = scores['compound']
                total_compound += compound
                count += 1
                analyzed_headlines.append({
                    "title": title,
                    "score": compound,
                    "link": item['link']
                })
                
        avg_score = total_compound / count if count > 0 else 0
        
        # Normalize/Interpret VADER Compound Score (-1 to 1)
        # > 0.05: Positive
        # < -0.05: Negative
        # We want "Fear & Greed" labels
        
        label = "Neutral"
        if avg_score > 0.2: label = "Greed (Optimism)"
        if avg_score > 0.6: label = "Euphoria"
        if avg_score < -0.2: label = "Fear (Pessimism)"
        if avg_score < -0.6: label = "Panic"
        
        # Social Hype Boost (Mock integration)
        social_hype = get_social_hype(ticker)
        
        return {
            "ticker": ticker,
            "score": avg_score,
            "label": label,
            "count": count,
            "headlines": analyzed_headlines[:5], # Top 5
            "social_hype": social_hype
        }
    except Exception as e:
        print(f"Error in sentiment analysis: {e}")
        return {"error": str(e)}

def get_inverse_cramer_data():
    """
    Returns mock data for the 'Inverse Cramer' strategy vs S&P 500.
    """
    series = []
    spy_val = 100
    inv_val = 100
    
    base = datetime.today()
    date_list = [base - timedelta(days=x) for x in range(30)]
    date_list.reverse()
    
    for date in date_list:
        # Random daily move
        move = random.gauss(0.0005, 0.01) # Slight positive drift
        
        spy_val *= (1 + move)
        # Inverse Cramer logic for demo
        inv_move = move * -0.2 + random.gauss(0.001, 0.008) 
        inv_val *= (1 + inv_move)
        
        series.append({
            "date": date.strftime('%Y-%m-%d'),
            "SPY": round(spy_val, 2),
            "InverseCramer": round(inv_val, 2)
        })
        
    return {
        "series": series,
        "summary": {
            "SPY_Return": f"{((spy_val - 100)/100)*100:.1f}%",
            "InverseCramer_Return": f"{((inv_val - 100)/100)*100:.1f}%",
            "Alpha": f"{((inv_val - spy_val)/100)*100:.1f}%"
        },
        "latest_picks": [
            {"ticker": "NVDA", "cramer_call": "BUY", "inverse_action": "SELL", "result": "+4.2%"},
            {"ticker": "TSLA", "cramer_call": "SELL", "inverse_action": "BUY", "result": "+2.1%"},
            {"ticker": "COIN", "cramer_call": "BUY", "inverse_action": "SELL", "result": "-1.5%"}
        ]
    }

def get_social_hype(ticker: str):
    """
    Generates mock social hype data simulating scraping Reddit/Twitter.
    In a real app, this would use PRAW (Reddit) and Tweepy (Twitter) with cached storage.
    """
    # Deterministic-ish random based on ticker string hash
    seed = sum(ord(c) for c in ticker)
    random.seed(seed + datetime.now().hour) # Changes hourly
    
    reddit_mentions = random.randint(50, 5000)
    twitter_mentions = random.randint(500, 50000)
    sentiment_positive = random.uniform(0.1, 0.9)
    
    # Generate some fake "Top Comments"
    comments = [
        f"${ticker} is going to the moon! 🚀",
        f"Bearish on {ticker}, fundamentals look weak.",
        f"Just bought more {ticker} calls.",
        f"Anyone seeing this volume on {ticker}?",
        f"{ticker} is the next NVDA."
    ]
    
    return {
        "reddit_mentions": reddit_mentions,
        "twitter_mentions": twitter_mentions,
        "sentiment_score": round(sentiment_positive * 100, 1), # 0-100
        "hype_score": round((reddit_mentions + twitter_mentions/10) / 100, 1), # Arbitrary hype metric
        "top_comments": random.sample(comments, 3)
    }

def get_trending_tickers():
    """
    Returns a list of 'trending' tickers on social media (Mock).
    """
    # Mock trending list
    trending = [
        {"ticker": "NVDA", "name": "NVIDIA", "mentions": 15420, "sentiment": "Bullish", "change": "+5.2%"},
        {"ticker": "TSLA", "name": "Tesla", "mentions": 12300, "sentiment": "Mixed", "change": "-1.8%"},
        {"ticker": "AMD", "name": "AMD", "mentions": 8500, "sentiment": "Bullish", "change": "+2.1%"},
        {"ticker": "PLTR", "name": "Palantir", "mentions": 7200, "sentiment": "Bullish", "change": "+3.4%"},
        {"ticker": "GME", "name": "GameStop", "mentions": 5000, "sentiment": "Bearish", "change": "-0.5%"},
    ]
    return trending
