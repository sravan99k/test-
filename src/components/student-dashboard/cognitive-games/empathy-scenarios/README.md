# Empathy Scenarios Data Structure

This folder contains all empathy role-play scenarios organized by category for better maintainability and scalability.

## 📁 Folder Structure

```
empathy-scenarios/
├── types.ts           # TypeScript interfaces for scenarios
├── friendship.ts      # Friendship-related scenarios
├── family.ts          # Family-related scenarios
├── school.ts          # School-related scenarios
├── online.ts          # Online/social media scenarios
├── community.ts       # Community/neighborhood scenarios
├── index.ts           # Combines all scenarios and exports them
└── README.md          # This file
```

## 🧩 How to Add New Scenarios

### 1. Choose the Right Category File

Select the appropriate category file based on the scenario theme:
- **friendship.ts** - Friend conflicts, peer support, social situations
- **family.ts** - Parent issues, sibling relationships, home life
- **school.ts** - Academic stress, group projects, classroom dynamics
- **online.ts** - Cyberbullying, social media, digital communication
- **community.ts** - Neighborhood, helping others, civic engagement

### 2. Add a New Scenario

Each scenario follows this structure:

```typescript
{
  id: 7,                    // Unique ID (increment from last)
  category: "Friendship",   // Category name
  title: "Left Out of Game",
  situation: "Your friends are playing a game at recess but didn't invite you...",
  emotion: "😢 Hurt",
  responses: [
    { 
      text: "Response option 1", 
      feedback: "Explanation of why this is good/bad" 
    },
    { 
      text: "Response option 2", 
      feedback: "Perfect! This shows empathy..." 
    },
    // Add 3-4 response options per scenario
  ]
}
```

### 3. Feedback Guidelines

**For Excellent Responses:**
- Use keywords: "Perfect!", "Excellent!", "Great!"
- These trigger green feedback with 💖 icon
- Example: "Perfect! Shows empathy and offers support"

**For Good-But-Improvable Responses:**
- Use constructive language
- These trigger yellow feedback with 💡 icon
- Example: "Shows some support but could be more empathetic"
- The game will automatically show a better alternative

### 4. Update ID Numbers

Make sure each new scenario has a unique ID. Current IDs:
- 1-3: Friendship
- 4: Family
- 5-6: School
- 7+: Available for new scenarios

## 📊 Current Scenario Count

- **Friendship:** 3 scenarios
- **Family:** 1 scenario
- **School:** 2 scenarios
- **Online:** 0 scenarios (ready for expansion)
- **Community:** 0 scenarios (ready for expansion)

**Total:** 6 scenarios

## 🎯 Goal: 200+ Scenarios

To reach 200 scenarios, aim for:
- **Friendship:** 40 scenarios
- **Family:** 40 scenarios
- **School:** 40 scenarios
- **Online:** 40 scenarios
- **Community:** 40 scenarios

## 🔄 How It Works

1. Each category file exports an array of scenarios
2. `index.ts` combines all arrays using spread operator
3. Main game imports from `./empathy-scenarios`
4. Game randomly or sequentially presents scenarios

## ✅ Benefits of This Structure

- **Organized:** Easy to find and edit scenarios by category
- **Scalable:** Can add hundreds of scenarios without cluttering main file
- **Maintainable:** Each file is ~20-40 scenarios (manageable size)
- **Performant:** Only loads what's needed
- **Localizable:** Easy to create translated versions
- **Collaborative:** Multiple people can work on different categories

## 🚀 Next Steps

1. Add more scenarios to existing categories
2. Fill out `online.ts` and `community.ts`
3. Consider adding new categories if needed:
   - `sports.ts` - Team dynamics, competition
   - `bullying.ts` - Bullying prevention and response
   - `emotions.ts` - Self-regulation, emotional awareness

## 💡 Tips for Writing Scenarios

1. **Be age-appropriate** - Use language students understand
2. **Be realistic** - Base on real situations students face
3. **Be diverse** - Include various emotions and contexts
4. **Be balanced** - Mix easy and challenging scenarios
5. **Be educational** - Each should teach something valuable
6. **Be empathetic** - Model the behavior you want to teach
