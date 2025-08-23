## Content Update Guide — Replace Static Data with Provided Copy

This guide maps your new content to exact files and shows how to consolidate services into a single page. Follow steps top-to-bottom. Use pnpm exclusively.

### 0) Build commands
- pnpm install
- pnpm build
- pnpm dev

### 1) Homepage Hero — headline + subheadline + short copy
- File: `components/HeroSection.tsx`
- Replace the current heading and paragraph in the hero with:

```md
Headline: Where strategy meets humanity, transformation happens.

Subheadline: I help leaders, teams, and organizations unlock their potential, align culture with vision, and deliver sustainable results.

Short, high-impact intro (top of website):
Helping People and Organizations Thrive
Human Capital Alchemist and Coach helping leaders and teams unlock potential, navigate change, and build cultures where people and performance flourish. Our work blends strategic insight with a deep understanding of human behavior—because lasting success happens when people and strategy work in harmony.
```

Notes:
- Keep the existing CTA buttons. No pricing mentions here.
- Ensure `process.env.NEXT_PUBLIC_CALENDLY_URL` is set for “Book Now”.

### 2) About — Kareem bio, credentials, achievements
- File: `components/AboutSection.tsx`
- Replace the main descriptive text with the following. If needed, split into paragraphs within the existing layout.

```md
About Kareem Payne

Kareem T. Payne is a purposeful, passionate, and results-driven Human Capital Alchemist & Coach. With a career spanning diverse sectors—Retail, Hospitality, Financial Services, Energy, Manufacturing, Distribution, and Entrepreneurship—his work has impacted organizations and communities across the Caribbean and North America.

Currently, he specializes in helping organizations unlock their strategic potential by leveraging the growth and development of people. Through coaching, training, leadership development, and performance consulting, Kareem equips leaders and teams with the tools they need to thrive. As a qualified Emotional Intelligence (EI) practitioner, he champions EI as a catalyst for personal transformation, believing that self-awareness and emotional mastery are essential to lasting success.

Over his career, Kareem has worked with private enterprises, regional governments, and civil society organizations, gaining a rare breadth of experience that allows him to bridge business objectives with human potential. His contributions in the non-corporate sector have earned him awards and recognition from the European Union, the Kiwanis Club, and IChange Nations, while on the corporate side, he has delivered impactful keynotes and was consistently recognized as a top performer.

Whether in a boardroom, training room, or community hall, his message is consistent: growth is a choice, and learning never stops. A lifelong learner with a growth mindset, Kareem continually invests in his own development, embracing the philosophy:

“Stay Curious. Keep Learning.”
```

- Replace or expand any “achievements”/stats list with:

```md
Achievements
- Over 4000 entrepreneurs and team members trained across the Caribbean & North America
- 10+ keynotes delivered
- 100+ leaders and entrepreneurs coached
- 20+ businesses successfully launched
```

- Add a compact “Credentials/Certifications” block (use a simple list or badges):

```md
Credentials/Certifications
- MSc. Project Management & Evaluation
- BSc. Management with Psychology
- PMP (Project Management Professional)
- CPTD (Certified Professional in Talent Development)
- Certified Professional Coach (ICF Accredited Program)
- Certified Professional in Measuring the Impact of L&D
```

### 3) Company intro — Nobilis Talent Solutions
- File: `components/AboutSection.tsx` (place as a sub-section below bio) or add a small card on the homepage if preferred.

```md
About Nobilis Talent Solutions LLC

At Nobilis Talent Solutions, we are dedicated to transforming the way leaders, teams and organizations unlock their full potential. Our approach is both strategic and human-centered — grounded in evidence-based practices but tailored to the unique story, challenges, and goals of each client, which allow us to create dynamic solutions that elevate talent, inspire leadership, and ignite organizational growth.

Through our passion and our approach, we turn challenges into opportunities and individuals into empowered changemakers. We don’t just create plans; we create the conditions for sustainable change. That means listening deeply, asking the right questions, and challenging assumptions so we can unlock new possibilities together.

Whether it’s refining company culture, designing impactful development programs, or guiding leaders through transformation, we bring a fresh, purposeful approach to every partnership.

If you’re ready to reimagine what you or your people can achieve and build a thriving, future-ready career, business or organization, let’s connect and start the transformation journey.
```

### 4) Values — replace Core Values
- File: `components/AboutSection.tsx` (values array)
- Replace existing values with:

```md
Values

People at the Heart
- Every strategy we design begins with the human experience – unlocking potential, inspiring growth, and honoring the unique value each person brings.

Trusted Partnerships
- We intentionally collaborate. We work alongside you as a strategic partner, building solutions together that fit your goals, culture, and vision.

Integrity in Action
- We lead with transparency, authenticity and accountability. Our recommendations are grounded in what’s right for you, your people and your business – not in quick fixes.

Growth as a Way of Life
- We champion continuous learning, adaptability and resilience, helping leaders and teams turn challenges into catalysts for transformation. We push ourselves and our clients to be better.

Measurable Impact
- We focus on strategies that produce real, measurable outcomes.
```

### 5) Services — consolidate to a single page and remove pricing from UI
- Keep: `app/services/page.tsx` as the single services page.
- Remove pricing: delete pricing objects/mentions in the services data and hide any price UI.
- Update homepage section: `components/ServicesSection.tsx` to show concise tiles (no pricing) linking to `/services`.

Paste these service items (titles + summaries) into both the homepage Services tiles and the full Services page:

```md
Services

Individual & Group Coaching — Grow with purpose.
Personalized coaching that sparks holistic growth, strengthens confidence, and helps individuals and teams be better.

Performance Management Design — Solutions to drive engagement and results.
We reimagine the approach to managing performance. With an intentional focus on the people, we redesign performance systems to be more human, more agile, and more impactful.

Leadership Development Design — Leaders who inspire action.
From emerging leaders to seasoned execs, we craft experiences to grow leaders who inspire, influence, and deliver results in a changing world.

Talent Strategy Development — People plans that work.
We partner with you to design plans to attract, engage, retain, and grow the right people so your organization thrives long-term.

Succession & Workforce Planning Design — Ready for tomorrow, today.
Future-proof your organization with smart, scalable plans that ensure the right people are ready for the right roles—when it matters most. We also partner with you to create plans that will minimize risk and create the biggest impact on your value agenda.

Training & Facilitation — Learning that sticks.
Interactive, engaging and practical learning experiences that build skills and shift mindsets — in the room or online.

Competency Model Development — Defining what great looks like.
We partner with you to define and highlight the skills, behaviors, and mindsets that drive success in your organization – building clear actionable frameworks that guide hiring, development and performance.

Targeted Talent Acquisition — The right people, right away.
Find and attract top talent that aligns with your culture and delivers on your strategy. Strategic, data-informed and deeply human.
```

Multiple services pages currently exist (homepage tiles and a detailed page; optionally a dynamic slug). Make it one:
- Preferred: keep only `/services` and delete `app/services/[slug]/` directory. Before deleting, search for imports/usages.
- Alternative: keep files and add a rewrite so any `/services/:slug` resolves to `/services`.
  - File: `next.config.js` → in `rewrites()` add:

```js
{
  source: '/services/:slug*',
  destination: '/services',
}
```

### 6) Pricing policy — omit from site
- Do not show any prices on the website. In `app/services/page.tsx` and `components/ServicesSection.tsx` remove any price/duration fields and their UI.
- Coaching package PDFs can be prepared separately; do not link pricing publicly yet.

### 7) Contact & availability — update email everywhere
- File: `components/ContactSection.tsx`
  - Set email link to `nobilis.talent@gmail.com`.
  - Add a small note “Available globally.” in the contact details or footer of the card.
- File: `components/Footer.tsx`
  - Update email to `nobilis.talent@gmail.com`.

### 8) SEO defaults — update site identity
- File: `components/SEO.tsx`
  - Update defaults:
    - `title`: `Nobilis Talent Solutions — Where strategy meets humanity`
    - `description`: Use the short, high-impact hero copy (first paragraph) summarized to one sentence.
  - Ensure open graph image is still valid or replace if needed.

### 9) Navigation — ensure Services points to the single page
- File: `components/Navigation.tsx`
  - Ensure the Services link routes to `/services`.

---

## Full copy reference (for easy paste)

```md
Headline: Where strategy meets humanity, transformation happens.

Subheadline: I help leaders, teams, and organizations unlock their potential, align culture with vision, and deliver sustainable results.

Short, High Impact (top of website)
Helping People and Organizations Thrive
Human Capital Alchemist and Coach helping leaders and teams unlock potential, navigate change, and build cultures where people and performance flourish. Our work blends strategic insight with a deep understanding of human behavior—because lasting success happens when people and strategy work in harmony.

About Kareem Payne
Kareem T. Payne is a purposeful, passionate, and results-driven Human Capital Alchemist & Coach... [use the full About text above]

Credentials/Certifications
- MSc. Project Management & Evaluation
- BSc. Management with Psychology
- PMP (Project Management Professional)
- CPTD (Certified Professional in Talent Development)
- Certified Professional Coach (ICF Accredited Program)
- Certified Professional in Measuring the Impact of L&D

Achievements
- Over 4000 entrepreneurs and team members trained across the Caribbean & North America
- 10+ keynotes delivered
- 100+ leaders and entrepreneurs coached
- 20+ businesses successfully launched

About Nobilis Talent Solutions LLC
[use the full Company text above]

Values
[use the five values and descriptions above]

Services
[use the eight services list above]

Contact & Availability
- Business Contact – nobilis.talent@gmail.com
- Service Availability – Available globally.
```

---

## Implementation Status Checklist

### ✅ Completed Tasks
- [x] **Brand Showcase Page Created** - New responsive page at `app/brand-showcase/page.tsx` with hero, about, values, services, and contact sections
- [x] **Navigation Updated** - Added "Brand Showcase" link to both desktop and mobile navigation in `components/Navigation.tsx`
- [x] **Responsive Design** - Page uses Tailwind CSS with mobile-first responsive design
- [x] **Build Success** - Production build passes with new page included
- [x] **Firebase Admin Fix** - Updated to lazy initialization to prevent build failures
- [x] **Image Issues Resolved** - Fixed Unsplash image URLs and added error handling with fallback backgrounds
- [x] **Client Component Setup** - Properly configured as client component for interactive features
- [x] **Homepage Hero Update** - Updated `components/HeroSection.tsx` with new headline, subheadline, and intro copy
- [x] **About Section Update** - Updated `components/AboutSection.tsx` with Kareem's bio, credentials, achievements, values, and company intro
- [x] **Services Consolidation** - Removed pricing from `app/services/page.tsx` and `components/ServicesSection.tsx`, updated with new service content
- [x] **Contact Email Update** - Updated email to `nobilis.talent@gmail.com` in `components/ContactSection.tsx` and `components/Footer.tsx`
- [x] **SEO Updates** - Updated `components/SEO.tsx` with new title and description
- [x] **Services Rewrite** - Added rewrite rule in `next.config.js` for `/services/:slug*` → `/services`
- [x] **Production Build** - All changes successfully compiled and built

### ❌ Pending Tasks (Original Content Update Guide)
- [x] **All tasks completed!** - All items from the original content update guide have been implemented

### 🔧 Issues to Address
- [x] **Missing Images** - Fixed Unsplash image URLs and added error handling with fallback backgrounds
- [x] **Image Optimization** - Images are optimized with proper sizing and error handling
- [x] **Content Integration** - Successfully integrated brand-showcase content into main site sections
- [x] **Pricing Removal** - Successfully removed all pricing information from services pages
- [x] **Email Updates** - Updated all contact information across the site
- [x] **SEO Updates** - Updated site identity and metadata
- [x] **Build Verification** - All changes pass production build

### 📋 Summary
All tasks from the CONTENT_UPDATE_GUIDE.md have been successfully completed:

1. ✅ **Homepage Hero** - Updated with new headline and messaging
2. ✅ **About Section** - Updated with Kareem's bio, credentials, achievements, and values
3. ✅ **Company Intro** - Added Nobilis Talent Solutions LLC description
4. ✅ **Services** - Updated with new service offerings, removed pricing
5. ✅ **Contact Information** - Updated email to nobilis.talent@gmail.com
6. ✅ **SEO** - Updated site title and description
7. ✅ **Navigation** - Added Brand Showcase link
8. ✅ **Build Success** - All changes compile and build successfully

The website now reflects the new branding and content from the CONTENT_UPDATE_GUIDE.md. The brand-showcase page serves as a demonstration of the new design approach, while the main site components have been updated to match this new branding and content.

---

**Note:** The website is now fully updated with the new content and branding. All pages are responsive, build successfully, and follow the new messaging and design approach outlined in the content update guide.



