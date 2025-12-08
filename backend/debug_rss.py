import feedparser
import urllib.parse
import sys

def fetch_google_news_rss(ticker: str):
    print(f"Fetching news for {ticker}...")
    encoded_query = urllib.parse.quote(f"{ticker} stock news")
    rss_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-US&gl=US&ceid=US:en"
    print(f"URL: {rss_url}")
    
    try:
        # Use a real User-Agent
        feed = feedparser.parse(rss_url, agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
        
        print(f"Feed Status: {feed.get('status', 'Unknown')}")
        print(f"Feed Entries: {len(feed.entries)}")
        sys.stdout.flush()
        
        if len(feed.entries) > 0:
            print(f"First Entry: {feed.entries[0].title}")
            print(f"Link: {feed.entries[0].link}")
        else:
            print("No entries found.")
            
    except Exception as e:
        print(f"Error parsing feed: {e}")

if __name__ == "__main__":
    fetch_google_news_rss("TSLA")
