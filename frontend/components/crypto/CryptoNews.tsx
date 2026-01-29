"use client";

import React, { useEffect, useState } from 'react';
import { getCryptoNews } from '@/lib/api';
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NewsArticle {
    title: string;
    body: string;
    source: string;
    url: string;
    published_on: number;
    sentiment: string;
    image_url: string;
}

export default function CryptoNews() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNews = async () => {
        try {
            const data = await getCryptoNews();
            setNews(data);
        } catch (error) {
            console.error("Failed to fetch crypto news", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
        const interval = setInterval(fetchNews, 300000); // Update every 5 minutes
        return () => clearInterval(interval);
    }, []);

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return <TrendingUp className="w-3 h-3 text-green-500" />;
            case 'negative': return <TrendingDown className="w-3 h-3 text-red-500" />;
            default: return <Minus className="w-3 h-3 text-gray-500" />;
        }
    };

    const getSentimentBadge = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'negative': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    if (loading) {
        return (
            <Card className="bg-[#111] border-[#222]">
                <CardHeader>
                    <CardTitle className="text-gray-200 flex items-center gap-2">
                        <Newspaper className="w-4 h-4 text-cyan-500" /> Crypto News Feed
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-slate-800/50 rounded-lg" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (news.length === 0) {
        return (
            <Card className="bg-[#111] border-[#222]">
                <CardHeader>
                    <CardTitle className="text-gray-200 flex items-center gap-2">
                        <Newspaper className="w-4 h-4 text-cyan-500" /> Crypto News Feed
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-6 text-center text-gray-500 text-sm">
                        No news available at the moment
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-[#111] border-[#222]">
            <CardHeader>
                <CardTitle className="text-gray-200 flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-cyan-500" /> Crypto News Feed
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                {news.map((article, idx) => (
                    <a
                        key={idx}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 rounded-xl bg-[#0A0A0A] border border-[#222] hover:border-cyan-500/30 hover:bg-[#141414] transition-all duration-300 group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold ${getSentimentBadge(article.sentiment)}`}>
                                {getSentimentIcon(article.sentiment)}
                                {article.sentiment.toUpperCase()}
                            </div>
                            <div className="text-[10px] text-gray-600">
                                {new Date(article.published_on * 1000).toLocaleDateString()}
                            </div>
                        </div>

                        <h4 className="text-sm font-bold text-gray-200 group-hover:text-cyan-300 transition-colors mb-2 line-clamp-2">
                            {article.title}
                        </h4>

                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                            {article.body}
                        </p>

                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-600 font-mono">
                                {article.source}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-cyan-500 group-hover:text-cyan-400 font-medium">
                                Read More <ExternalLink className="w-2.5 h-2.5" />
                            </div>
                        </div>
                    </a>
                ))}
            </CardContent>
        </Card>
    );
}
