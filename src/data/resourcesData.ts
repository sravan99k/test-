export interface ResourceSection {
    id: string;
    title: string;
    content: string;
    image?: string;
}

export interface ResourceTopic {
    id: string;
    title: string;
    introduction: string;
    imageUrl: string;
    sections: ResourceSection[];
}

export const resourcesData: ResourceTopic[] = [
    {
        id: 'stress-management',
        title: 'Stress Management',
        introduction: 'Simple tools and tips to help you relax and build a healthier mind every day.',
        imageUrl: '/Resource Images/Stress management.webp',
        sections: [
            {
                id: 'understanding-stress',
                title: 'Why It Matters',
                content: 'Stress is a normal part of life...',
            },
            {
                id: 'coping-techniques',
                title: 'Coping Techniques',
                content: '**1. Deep Breathing**\nTake a slow breath...\n• Breathe in for 4 seconds\n• Hold for 2\n• Exhale for 6\n○ Repeat 5-10 times',
            }
        ]
    },
    {
        id: 'sleep-relaxation',
        title: 'Sleep & Relaxation',
        introduction: 'Better sleep for a better day.',
        imageUrl: '/Resource Images/Sleep & Relaxation.webp',
        sections: []
    },
    {
        id: 'healthy-mind-habits',
        title: 'Healthy Mind Habits',
        introduction: 'Cultivate positivity and resilience.',
        imageUrl: '/Resource Images/Healthy Mind Habits.webp',
        sections: []
    },
    {
        id: 'focus-study-skill',
        title: 'Focus & Study Skills',
        introduction: 'Sharpen your focus and learn smarter.',
        imageUrl: '/Resource Images/Focus & Study Skill.webp',
        sections: []
    },
    {
        id: 'peer-support-sharing',
        title: 'Peer Support & Sharing',
        introduction: 'Connect with others and share your journey.',
        imageUrl: '/Resource Images/Peer Support & Sharing.webp',
        sections: []
    },
    {
        id: 'digital-wellness',
        title: 'Digital Wellness',
        introduction: 'Find balance in a digital world.',
        imageUrl: '/Resource Images/Digital Wellness.webp',
        sections: []
    },
    {
        id: 'growth-mindset-motivation',
        title: 'Growth Mindset',
        introduction: 'Believe in your ability to grow.',
        imageUrl: '/Resource Images/Growth Mindset & Motivation.webp',
        sections: []
    },
    {
        id: 'values-citizenship-education',
        title: 'Values & Citizenship',
        introduction: 'Being a positive part of your community.',
        imageUrl: '/Resource Images/Values and Citizenship Education.webp',
        sections: []
    },
    {
        id: 'when-to-ask-for-help',
        title: 'When to Ask for Help',
        introduction: 'Knowing when you need extra support.',
        imageUrl: '/Resource Images/When to Ask for Help.webp',
        sections: []
    },
    {
        id: 'physical-wellness-nutrition',
        title: 'Physical Wellness',
        introduction: 'Caring for your body.',
        imageUrl: '/Resource Images/Physical wellness & Nutrition.webp',
        sections: []
    }
];

