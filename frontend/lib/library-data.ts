import {
    Building2,
    FileText,
    Calculator,
    Landmark,
    TrendingUp,
    BarChart3,
    Globe,
    Target,
    PiggyBank,
    Users,
    Home,
    BookOpen,
    Gavel,
    LineChart,
    Briefcase,
    PieChart,
    DollarSign,
    Wallet,
    Building
} from 'lucide-react';

export interface LibraryTopic {
    id: string;
    title: string;
    icon: React.ElementType;
    description: string;
    terms: {
        term: string;
        definition: string;
        example?: string;
    }[];
}

export const LIBRARY_TOPICS: LibraryTopic[] = [
    {
        id: 'corporate-finance',
        title: 'Corporate Finance',
        icon: Building2,
        description: 'Managing capital structure, funding and financial decisions.',
        terms: [
            { term: 'WACC', definition: 'Weighted Average Cost of Capital - the average rate a company expects to pay to finance its assets.' },
            { term: 'NPV', definition: 'Net Present Value - the difference between the present value of cash inflows and outflows.' },
            { term: 'IRR', definition: 'Internal Rate of Return - the expected compound annual rate of return that will be earned on a project or investment.' }
        ]
    },
    {
        id: 'financial-accounting',
        title: 'Financial Accounting',
        icon: FileText,
        description: 'Reporting financial information to external users.',
        terms: [
            { term: 'GAAP', definition: 'Generally Accepted Accounting Principles - standard accounting rules used in the US.' },
            { term: 'Accrual Basis', definition: 'Method of recording accounting transactions for revenue when earned and expenses when incurred.' }
        ]
    },
    {
        id: 'financial-management',
        title: 'Financial Management',
        icon: Calculator,
        description: 'Strategic planning, organizing, directing, and controlling of financial undertakings.',
        terms: [
            { term: 'Working Capital', definition: 'The difference between a company’s current assets and current liabilities.' }
        ]
    },
    {
        id: 'banking-finance',
        title: 'Banking & Finance',
        icon: Landmark,
        description: 'Study of financial institutions and markets.',
        terms: [
            { term: 'Spread', definition: 'The difference between the interest rate a bank pays to depositors and the interest rate it receives from loans.' }
        ]
    },
    {
        id: 'financial-market',
        title: 'Financial Market',
        icon: TrendingUp,
        description: 'Marketplace for trading financial assets.',
        terms: [
            { term: 'Liquidity', definition: 'How easily an asset can be bought or sold without affecting its price.' },
            { term: 'Ask Price', definition: 'The lowest price a seller is willing to accept for a security.' }
        ]
    },
    {
        id: 'financial-statement-analysis',
        title: 'Statement Analysis',
        icon: BarChart3,
        description: 'Analyzing a company\'s financial statements for decision-making.',
        terms: [
            { term: 'Horizontal Analysis', definition: 'Comparison of historical financial information over a series of reporting periods.' }
        ]
    },
    {
        id: 'macroeconomics',
        title: 'Macroeconomics',
        icon: Globe,
        description: 'Performance, structure, behavior, and decision-making of an economy as a whole.',
        terms: [
            { term: 'GDP', definition: 'Gross Domestic Product - total value of goods and services produced within a country.' },
            { term: 'Inflation', definition: 'The rate at which prices for goods and services rise.' }
        ]
    },
    {
        id: 'international-finance',
        title: 'International Finance',
        icon: Globe,
        description: 'Monetary interactions between two or more countries.',
        terms: [
            { term: 'Exchange Rate', definition: 'The value of one currency for the purpose of conversion to another.' }
        ]
    },
    {
        id: 'microeconomics',
        title: 'Microeconomics',
        icon: Target,
        description: 'Behavior of individuals and firms in making decisions.',
        terms: [
            { term: 'Elasticity', definition: 'A measure of a variable\'s sensitivity to a change in another variable.' }
        ]
    },
    {
        id: 'investments',
        title: 'Investments',
        icon: PiggyBank,
        description: 'Allocation of money with the expectation of a positive benefit/return.',
        terms: [
            { term: 'Diversification', definition: 'Risk management strategy that mixes a wide variety of investments within a portfolio.' }
        ]
    },
    {
        id: 'management-communication',
        title: 'Management Comm.',
        icon: Users,
        description: 'Communication within an organization.',
        terms: [
            { term: 'Stakeholder', definition: 'A party that has an interest in a company and can either affect or be affected by the business.' }
        ]
    },
    {
        id: 'real-estate',
        title: 'Real Estate',
        icon: Home,
        description: 'Property consisting of land and the buildings on it.',
        terms: [
            { term: 'REIT', definition: 'Real Estate Investment Trust - a company that owns, operates, or finances income-generating real estate.' }
        ]
    },
    {
        id: 'taxation',
        title: 'Taxation',
        icon: FileText,
        description: 'System of raising money to finance government.',
        terms: [
            { term: 'Capital Gains Tax', definition: 'Tax on the profit realized on the sale of a non-inventory asset.' }
        ]
    },
    {
        id: 'accounting-principles',
        title: 'Accounting Principles',
        icon: BookOpen,
        description: 'Foundational rules of accounting.',
        terms: [
            { term: 'Matching Principle', definition: 'Requirement that expenses be reported in the same period as the revenues they helped generate.' }
        ]
    },
    {
        id: 'business-ethics',
        title: 'Business Ethics',
        icon: Gavel,
        description: 'Moral principles playing a role in business activity.',
        terms: [
            { term: 'CSR', definition: 'Corporate Social Responsibility - a business model that helps a company be socially accountable.' }
        ]
    },
    {
        id: 'economics',
        title: 'Economics',
        icon: LineChart,
        description: 'Social science that studies the production, distribution, and consumption of goods and services.',
        terms: [
            { term: 'Opportunity Cost', definition: 'The loss of potential gain from other alternatives when one alternative is chosen.' }
        ]
    },
    {
        id: 'investment-management',
        title: 'Investment Mgmt',
        icon: Briefcase,
        description: 'Professional asset management of various securities.',
        terms: [
            { term: 'Alpha', definition: 'Measure of performance on a risk-adjusted basis.' }
        ]
    },
    {
        id: 'managerial-accounting',
        title: 'Managerial Acct.',
        icon: Calculator,
        description: 'Accounting for internal use by management.',
        terms: [
            { term: 'Cost Center', definition: 'A department or other unit within an organization to which costs may be charged.' }
        ]
    },
    {
        id: 'marketing-fundamentals',
        title: 'Marketing',
        icon: Target,
        description: 'Action or business of promoting and selling products.',
        terms: [
            { term: '4 Ps', definition: 'Price, Product, Promotion, and Place - the four key elements of marketing.' }
        ]
    },
    {
        id: 'organizational-behavior',
        title: 'Org. Behavior',
        icon: Users,
        description: 'Study of human behavior in organizational settings.',
        terms: [
            { term: 'Corporate Culture', definition: 'The beliefs and behaviors that determine how a company\'s employees and management interact.' }
        ]
    },
    {
        id: 'portfolio-management',
        title: 'Portfolio Mgmt',
        icon: PieChart,
        description: 'Art and science of selecting and overseeing a group of investments.',
        terms: [
            { term: 'Asset Allocation', definition: 'Strategy that aims to balance risk and reward by apportioning a portfolio\'s assets according to an individual\'s goals.' }
        ]
    },
    {
        id: 'private-equity',
        title: 'Private Equity',
        icon: DollarSign,
        description: 'Capital that is not listed on a public exchange.',
        terms: [
            { term: 'LBO', definition: 'Leveraged Buyout - the acquisition of another company using a significant amount of borrowed money.' }
        ]
    },
    {
        id: 'finance-topics',
        title: 'General Finance',
        icon: Wallet,
        description: 'Broad range of finance-related subjects.',
        terms: [
            { term: 'Fintech', definition: 'Financial Technology - innovation that aims to compete with traditional financial methods.' }
        ]
    },
    {
        id: 'financial-modeling',
        title: 'Financial Modeling',
        icon: Building,
        description: 'Summary of a company\'s expenses and earnings in a spreadsheet.',
        terms: [
            { term: 'DCF', definition: 'Discounted Cash Flow - a valuation method used to estimate the value of an investment based on its expected future cash flows.' }
        ]
    }
];
