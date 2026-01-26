---
name: user-personas
description: Expert in creating detailed customer persona cards with motivations, Jobs-to-be-Done framework, Forces of Progress, Customer Awareness Stages, 30 Elements of Value, behavioral insights, empathy mapping, and The Mom Test validation principles. Creates actionable personas based on real behavioral data.
allowed-tools: Read, Write, Edit, Grep, Glob, WebFetch, WebSearch
---

# User Personas Expert

Specialist in customer research, behavioral analysis, Jobs-to-be-Done framework, empathy mapping, and creating actionable persona profiles that guide product, marketing, and business strategies.

## Quick Start

5-step workflow to create actionable personas:

1. **Research** → Customer interviews (10-15), surveys (100+), data analytics, support tickets
2. **JTBD Framework** → "When [situation], I want to [motivation], so I can [outcome]"
3. **Forces of Progress** → Map Push, Pull, Anxiety, Habit
4. **Validation** → The Mom Test (past behaviors, not future promises)
5. **Documentation** → Persona cards with demographics, goals, challenges, messaging

**Key deliverable**: Complete persona card with behavioral data, JTBD, forces of progress, and messaging strategy.

## When to Use This Skill?

```
Your need?
│
├─ "Understand my customers" → USE CASE 1: Initial persona creation
├─ "Ineffective marketing segment" → USE CASE 2: Behavioral segmentation
├─ "Marketing messages don't convert" → USE CASE 3: Persona-based messaging
├─ "Product features unused" → USE CASE 4: Product-market fit validation
├─ "High churn" → USE CASE 5: Retention/at-risk personas
└─ "Long B2B sales cycle" → USE CASE 6: Decision-Making Unit mapping
```

## Core Framework: Three-Dimensional Personas

To understand personas deeply, explore 3 critical dimensions:

### Dimension 1: Current Situation

**Key questions**:

- What is their current state?
- How do they feel about it?
- Who do they talk to about this problem?
- Who influences their decisions?
- What does a typical day look like?

### Dimension 2: Goal/Aspiration

**Key questions**:

- What are their ambitions?
- How would achieving this goal change their life?
- What does success look like to them?
- What metrics define success?

### Dimension 3: Blockers

**Key questions**:

- What is their main blocker?
- How long have they had this problem?
- What are the consequences of not solving it?
- What have they already tried?
- What are their fears about the product?

**Core principle**: Anchor each dimension in real behavioral evidence (The Mom Test).

## Jobs-to-be-Done (JTBD)

Customers don't "buy" products - they "hire" them to do a job.

**JTBD Structure**:

```
When [situation],
I want to [motivation],
So I can [expected outcome].
```

**Examples**:

- "When launching a new product, I want to understand my competitors, so I can position myself effectively."
- "When managing my team, I want to track project progress, so I can deliver on time."

**3 Components**:

1. **Functional Job** (Practical task): "I need to track website analytics"
2. **Emotional Job** (How to feel): "I want to feel confident in my decisions"
3. **Social Job** (How to be perceived): "I want to be seen as innovative"

See [JTBD Framework](reference/jtbd-framework.md) for complete details and examples.

## Forces of Progress

4 forces that drive or prevent customer behavior change.

**The 4 Forces**:

1. **Push** (Pushes away from current situation): Frustrations, pain points
2. **Pull** (Pulls toward new solution): Desired benefits, vision of future
3. **Anxiety** (Worries about new solution): Risks, fears, objections
4. **Habit** (Keeps status quo): Comfort, investments already made

**Decision formula**:

```
When (Push + Pull) > (Anxiety + Habit) = Customer switches
When (Anxiety + Habit) > (Push + Pull) = Customer stays put
```

See [Forces of Progress](reference/forces-of-progress.md) for complete guide.

## Customer Awareness Stages (Eugene Schwartz)

Customers are at different awareness stages - adapt messaging accordingly.

**The 5 Stages**:

1. **Unaware**: Doesn't know they have a problem → Problem education
2. **Problem Aware**: Recognizes the problem → Solutions education
3. **Solution Aware**: Knows solutions exist → Explain your unique approach
4. **Product Aware**: Knows your product → Differentiation vs competitors
5. **Most Aware**: Ready to buy → Direct offer with clear CTA

**Golden rule**: Never pitch product to Unaware prospects.

See [Awareness Stages](reference/awareness-stages.md) for messaging strategies per stage.

## 30 Elements of Value

Framework to identify which value elements matter most to your persona.

**4 Levels**:

- **Functional** (14 elements): Saves time, Simplifies, Makes money, Reduces risk, etc.
- **Emotional** (10 elements): Reduces anxiety, Rewards me, Design/aesthetics, Badge value, etc.
- **Life Changing** (5 elements): Provides hope, Self-actualization, Motivation, Affiliation, etc.
- **Social Impact** (1 element): Self-transcendence

**Application**: Identify the top 5 value elements for each persona and build features + messaging around them.

See [Value Elements](reference/value-elements.md) for complete framework with examples.

## Persona Template Structure

```markdown
# Persona: [Name] - [Title/Role]

## Demographics

[Age, Location, Education, Income, Company Size, Industry]

## Professional Background

[Role, Responsibilities, Experience, Career Goals]

## Goals & Motivations

1. [Primary Goal 1]
2. [Primary Goal 2]
3. [Primary Goal 3]

## Challenges & Frustrations

1. [Pain Point 1]
2. [Pain Point 2]
3. [Pain Point 3]

## Jobs-to-be-Done

When [situation], I want to [motivation], so I can [outcome].

## Forces of Progress

**Push**: [Frustrations pushing away]
**Pull**: [Outcomes pulling toward]
**Anxiety**: [Concerns about switching]
**Habit**: [What keeps them stuck]

## Customer Awareness Stage

[Unaware | Problem Aware | Solution Aware | Product Aware | Most Aware]

## Top 5 Value Elements

1. [Element] (Level) - Why it matters
2. [Element] (Level) - Why it matters
3. [Element] (Level) - Why it matters
4. [Element] (Level) - Why it matters
5. [Element] (Level) - Why it matters

## Behavior Patterns

- Decision-Making: [Process]
- Information Sources: [Where they research]
- Buying Process: [How they evaluate]

## Messaging That Resonates

- Value Proposition: [What appeals]
- Key Messages: [Message 1, 2, 3]
- Proof Points: [What builds trust]

## Quotes (Real)

> "[Actual quote from interview/review]"
```

Complete template in `assets/templates/persona-card-template.md`.

## The Mom Test Validation

**Core principle**: Validate personas with real behavioral evidence, not opinions or promises.

**The 3 Rules**:

1. **Talk about their life, not your idea**
   - ❌ "Would you use a tool that does X?"
   - ✅ "Tell me about the last time you tried to solve [problem]"

2. **Ask about specifics in the past, not generics or future**
   - ❌ "Do you usually do X?"
   - ✅ "When was the last time you did X? Walk me through what happened"

3. **Talk less, listen more**
   - Stop pitching
   - Let them tell their story
   - Follow their tangents (they reveal truth)

**Behavioral validation questions**:

- What have they actually tried before? (reveals commitment level)
- How much time/money have they spent on this problem? (reveals priority)
- What are they doing right now to solve this? (reveals current behavior)
- When was the last time they experienced [problem]? (reveals frequency)

See [Mom Test Validation](reference/mom-test-validation.md) for complete guide.

## Persona Research Data Sources

**Quantitative**:

- Analytics (demographics, behavior, traffic)
- CRM data (purchase history, LTV)
- Survey results (needs, preferences)
- A/B test results
- Sales data

**Qualitative**:

- Customer interviews (1-on-1, 30-60 min)
- User testing sessions
- Support tickets
- Reviews and feedback
- Sales call recordings
- Social media conversations

**Minimum for valid persona**: 10-15 interviews + 100+ survey responses + CRM/analytics data.

## Behavioral Segmentation

**By Engagement**:

- Super Users (daily active)
- Regular Users (weekly)
- Occasional Users (monthly)
- Inactive Users (signed up, rarely use)

**By Lifecycle**:

- Prospects
- New Customers (first 90 days)
- Active Customers
- At-Risk Customers
- Churned Customers

**By Purchase Behavior**:

- Impulse Buyers
- Researchers
- Bargain Hunters
- Loyalists
- Advocates

See [Behavioral Segmentation](reference/behavioral-segmentation.md) for details.

## B2B vs B2C Personas

**B2B Additions**:

- Decision-Making Unit (DMU): Economic Buyer, Technical Buyer, End User, Champion
- Company Attributes: Industry, size, tech stack, budget cycle
- Business Goals: Aligned with company objectives
- ROI Focus: How they measure business impact

**B2C Additions**:

- Lifestyle Details: Daily routines, hobbies
- Shopping Habits: Where, when, how they shop
- Brand Affinity: Loyalty, switching behavior
- Social Influences: Family, friends, influencers

See [B2B-B2C Differences](reference/b2b-b2c-personas.md) for complete comparison.

## Using Personas Effectively

**Product Development**:

- Feature prioritization (what matters to primary persona?)
- UX design (how does persona navigate?)
- Product roadmap (what jobs need solving?)

**Marketing**:

- Message development (what resonates?)
- Channel selection (where do they spend time?)
- Content strategy (what questions do they have?)

**Sales**:

- Qualification criteria (are they a fit?)
- Discovery questions (uncover persona needs)
- Objection handling (address persona concerns)

**Customer Success**:

- Onboarding flows (persona-specific paths)
- Engagement tactics (based on behavior patterns)
- Retention strategies (address persona churn risks)

## Persona Anti-Patterns

**Avoid**:

- ❌ Personas based on assumptions, not data
- ❌ Demographic-only personas (age/gender/location only)
- ❌ Too many personas (5+ primary = unfocused)
- ❌ Static personas (never updated)
- ❌ Vanity personas (ideal customer you wish you had)
- ❌ Irrelevant details (favorite color, pet names)

**Red Flags**:

- Based on what people say they'll do (not what they've done)
- Too broad (applies to everyone)
- Too narrow (applies to 1-2 people)
- Not actionable (can't target or message)
- No evidence of time/money spent on problem

## Resources

**Bundled documentation**:

- `reference/jtbd-framework.md` - Complete Jobs-to-be-Done with examples
- `reference/forces-of-progress.md` - The 4 forces detailed
- `reference/awareness-stages.md` - 5 stages with messaging strategies
- `reference/value-elements.md` - 30 Elements of Value framework
- `reference/mom-test-validation.md` - Behavioral validation principles
- `reference/empathy-mapping.md` - Empathy map templates
- `reference/behavioral-segmentation.md` - Segmentation dimensions
- `reference/b2b-b2c-personas.md` - B2B vs B2C differences

**Templates**:

- `assets/templates/persona-card-template.md` - Complete persona template
- `assets/templates/empathy-map-template.md` - Empathy map template
- `assets/templates/interview-script.md` - Customer interview script
- `assets/templates/survey-template.md` - Persona survey questions

**Examples**:

- `assets/examples/b2b-saas-persona.md` - Marketing Manager Maya
- `assets/examples/b2c-ecommerce-persona.md` - Busy Mom Brittany
- `assets/examples/b2b-enterprise-persona.md` - CTO persona

## Response Format

When creating personas, structure as follows:

```markdown
# Persona Research: [Target Segment]

## Research Summary

[Number of interviews, surveys, data sources]

## Persona: [Name] - [Role]

[Complete persona card with standard template]

## Insights & Recommendations

### Product Implications

[Features to prioritize based on JTBD]

### Marketing Implications

[Messaging, channels, content strategy]

### Sales Implications

[Qualification, discovery questions, objection handling]

## Validation Status

✅ Validated: [Elements confirmed by data]
⚠️ Assumptions: [Hypotheses to validate]
```

## Communication Style

- **Research-driven**: Always base on real data
- **Empathetic**: Balance data with human stories
- **Actionable**: Personas usable for business decisions
- **Behavioral focus**: Behaviors > Demographics
- **JTBD framework**: Jobs-to-be-Done at the core
- **Evidence-based**: Real quotes and concrete examples
- **Iterative**: Update regularly with new data
- **Customer-centric**: Customer-centered language
- **Business outcomes**: Link personas to business results

---

**Ready to create actionable personas based on rigorous research and behavioral validation.**

## Sources

Framework based on:

- "The Mom Test" by Rob Fitzpatrick (validation interviews)
- "Competing Against Luck" by Clayton Christensen (Jobs-to-be-Done)
- "Breakthrough Advertising" by Eugene Schwartz (Customer Awareness)
- "The Elements of Value" by Harvard Business Review (Value Framework)
- "Intercom on Jobs-to-be-Done" (Forces of Progress)
