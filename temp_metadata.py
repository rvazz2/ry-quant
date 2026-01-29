# Script to add category metadata to all library topics
# Run this to generate the complete category-enhanced data

topics_metadata = {
    'international-finance': {'category': 'Finance', 'difficulty': 'Advanced', 'tags': ['Currency', 'Exchange Rates', 'Global Finance'], 'relatedTopics': ['macroeconomics', 'banking-finance']},
    'microeconomics': {'category': 'Economics', 'difficulty': 'Beginner', 'tags': ['Microeconomics', 'Supply', 'Demand', 'Market Forces'], 'relatedTopics': ['macroeconomics', 'economics']},
    'investments': {'category': 'Investing', 'difficulty': 'Intermediate', 'tags': ['Investing', 'Portfolio', 'Risk Management'], 'relatedTopics': ['investment-management', 'portfolio-management', 'financial-market']},
    'management-communication': {'category': 'Business', 'difficulty': 'Beginner', 'tags': ['Communication', 'Corporate Governance', 'Leadership'], 'relatedTopics': ['organizational-behavior']},
    'real-estate': {'category': 'Real Estate', 'difficulty': 'Intermediate', 'tags': ['Real Estate', 'Property', 'REITs'], 'relatedTopics': ['investments', 'taxation']},
    'taxation': {'category': 'Tax', 'difficulty': 'Intermediate', 'tags': ['Taxation', 'Tax Planning', 'IRS'], 'relatedTopics': ['accounting-principles', 'financial-accounting']},
    'accounting-principles': {'category': 'Accounting', 'difficulty': 'Beginner', 'tags': ['Accounting', 'GAAP', 'Principles'], 'relatedTopics': ['financial-accounting', 'managerial-accounting']},
    'business-ethics': {'category': 'Business', 'difficulty': 'Beginner', 'tags': ['Ethics', 'CSR', 'Compliance'], 'relatedTopics': ['management-communication']},
    'economics': {'category': 'Economics', 'difficulty': 'Beginner', 'tags': ['Economics', 'Cost-Benefit', 'Trade'], 'relatedTopics': ['macroeconomics', 'microeconomics']},
    'investment-management': {'category': 'Investing', 'difficulty': 'Advanced', 'tags': ['Asset Management', 'Alpha', 'Performance'], 'relatedTopics': ['investments', 'portfolio-management']},
    'managerial-accounting': {'category': 'Accounting', 'difficulty': 'Intermediate', 'tags': ['Managerial Accounting', 'Cost Analysis', 'Budgeting'], 'relatedTopics': ['financial-accounting', 'accounting-principles']},
    'marketing-fundamentals': {'category': 'Business', 'difficulty': 'Beginner', 'tags': ['Marketing', 'Branding', 'Strategy'], 'relatedTopics': []},
    'organizational-behavior': {'category': 'Business', 'difficulty': 'Intermediate', 'tags': ['Organization', 'Leadership', 'Culture'], 'relatedTopics': ['management-communication']},
    'portfolio-management': {'category': 'Investing', 'difficulty': 'Advanced', 'tags': ['Portfolio', 'Asset Allocation', 'Diversification'], 'relatedTopics': ['investments', 'investment-management']},
    'private-equity': {'category': 'Finance', 'difficulty': 'Advanced', 'tags': ['Private Equity', 'LBO', 'Buyouts'], 'relatedTopics': ['corporate-finance', 'financial-modeling']},
    'finance-topics': {'category': 'Finance', 'difficulty': 'Beginner', 'tags': ['Finance', 'Personal Finance', 'Basics'], 'relatedTopics': []},
    'behavioral-finance': {'category': 'Finance', 'difficulty': 'Intermediate', 'tags': ['Psychology', 'Behavioral Economics', 'Biases'], 'relatedTopics': ['investments', 'economics']},
    'quantitative-analysis': {'category': 'Finance', 'difficulty': 'Advanced', 'tags': ['Quant', 'Analysis', 'Trading', 'Statistics'], 'relatedTopics': ['financial-statement-analysis', 'investments']},
    'crypto-assets': {'category': 'Investing', 'difficulty': 'Intermediate', 'tags': ['Cryptocurrency', 'Blockchain', 'Digital Assets'], 'relatedTopics': ['finance-topics']},
    'supply-chain': {'category': 'Business', 'difficulty': 'Intermediate', 'tags': ['Supply Chain', 'Operations', 'Logistics'], 'relatedTopics': []},
    'financial-modeling': {'category': 'Finance', 'difficulty': 'Advanced', 'tags': ['Modeling', 'Valuation', 'DCF'], 'relatedTopics': ['corporate-finance', 'financial-statement-analysis']},
}

for topic_id, metadata in topics_metadata.items():
    print(f"Topic: {topic_id}")
    print(f"  category: '{metadata['category']}'")
    print(f"  difficulty: '{metadata['difficulty']}'")
    print(f"  tags: {metadata['tags']}")
    print(f"  relatedTopics: {metadata['relatedTopics']}")
    print()
