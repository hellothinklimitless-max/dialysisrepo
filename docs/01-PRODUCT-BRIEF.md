# Interactive Video Learning + Quiz Platform — Frontend Design & Implementation Brief

*(Preserved verbatim as provided by the product owner. This is the authoritative UX/behavior/motion/accessibility specification. See 00-README-START-HERE.md for how the audit, open decisions, stack, and design tokens relate to this document, and 02-course-content-data.ts for the real content this spec should be built around.)*

I want you to design and implement a complete, polished frontend experience for the educational courses and quizzes already available in this project/context.

You already have access to the course/module content, video content, quiz questions, answers, and educational material. Reuse that existing content. Do not invent generic placeholder courses or replace the actual educational content.

The goal is to transform the existing material into a premium **interactive video learning platform** where users:

**Watch a module → complete an interactive assessment → learn from every answer → receive performance insights → complete/rate the module → continue through the course.**

This should feel like a real production educational product, NOT a generic quiz template, LMS dashboard, or basic form.

---

# 1. PRODUCT PHILOSOPHY

The quiz is not simply an assessment.

Every question should also be a **micro-learning experience**.

The fundamental interaction loop is:

**Question → Answer → Immediate Feedback → Explanation → Learning Insight → Key Takeaway → Progress**

Whether the learner answers correctly or incorrectly, they should leave the question knowing more than they did before answering it.

The product should feel:

* Professional
* Modern
* Clinical/educational
* Premium
* Calm
* Highly intuitive
* Encouraging rather than punitive
* Visually engaging without becoming childish or gamified

Avoid the visual language of Kahoot, school worksheets, generic LMS software, or flashy gaming interfaces.

---

# 2. OVERALL COURSE EXPERIENCE

Create a coherent learning flow connecting the existing course modules.

The primary journey should be:

**Course Overview**
↓
**Module**
↓
**Video Lesson**
↓
**Lesson Complete**
↓
**Start Knowledge Check**
↓
**Interactive Quiz**
↓
**Results**
↓
**Performance Insights**
↓
**Review / Retake**
↓
**Rate Quiz + Module**
↓
**Module Complete**
↓
**Next Module**

The learner should always understand:

* Where they are
* What module they are completing
* Their course progress
* What comes next

Avoid unnecessary navigation or distractions during lessons and assessments.

---

# 3. COURSE / MODULE INTERFACE

Create a premium learning interface for each module.

Include:

* Course title
* Module title
* Module number
* Estimated duration
* Progress through course
* Lesson status
* Video lesson
* Quiz status
* Completion state

Example:

**Dialysis Equipment & Machine Operation**

Module 03 of 08
12 min lesson · 8 question assessment

`████████░░░░ 42% Course Progress`

The page should visually prioritize the learning content rather than navigation.

---

# 4. VIDEO LEARNING EXPERIENCE

Design a polished video-learning interface using the existing module videos.

The video should be the primary visual focus.

Include:

* Play/pause
* Timeline
* Current time / duration
* Volume
* Playback speed
* Fullscreen
* Captions/subtitles if available
* Replay
* Video completion tracking

Show module context around the player without overcrowding it.

Once the lesson reaches completion, transition naturally into:

**Lesson Complete**

"You're ready to test what you've learned."

**Start Knowledge Check →**

Do not abruptly dump the learner into a quiz.

Create a deliberate transition from **learning mode → assessment mode**.

---

# 5. QUIZ INTRO SCREEN

Before beginning the assessment, provide a concise overview.

Example:

**Knowledge Check**

Test your understanding of Dialysis Machine Operation.

8 Questions
~5 Minutes
70% Passing Score

Every response includes an explanation and clinical learning insight.

**Begin Assessment →**

Optionally allow:

**Review Lesson**

The experience should communicate that the quiz is part of learning, not merely grading.

---

# 6. QUIZ QUESTION INTERFACE

The quiz format is primarily:

**Question + 4 options + one correct answer**

Design a highly polished question interface.

Include:

* Question number
* Progress bar
* Question text
* Four large answer cards
* A/B/C/D indicators
* Selected state
* Submit / Check Answer button

Example header:

**Knowledge Check**

Question 4 of 10

`████████░░░░░░`

Question content should be the strongest element on screen.

Answer cards must have:

Default state
Hover state
Selected state
Correct state
Incorrect state
Disabled/review state

The entire answer card should be clickable.

Do NOT reveal whether an answer is correct merely by selecting it.

The user selects an option first and then presses:

**Check Answer**

---

# 7. CORRECT ANSWER EXPERIENCE

A correct answer should create a subtle moment of achievement.

Use:

* Animated checkmark
* Soft success transition
* Very subtle positive motion
* Optional restrained particle/confetti effect for important milestones

Do not make routine answers excessively celebratory.

Then reveal an educational feedback panel.

Example:

**Correct!**

Rapid fluid removal can reduce circulating blood volume faster than the cardiovascular system can compensate.

### Clinical Insight

Watch for falling blood pressure, dizziness, nausea, cramping, and restlessness during treatment.

### Remember

Early recognition can prevent progression to severe intradialytic hypotension.

**Continue →**

The learner should gain additional knowledge even when they already knew the correct answer.

---

# 8. INCORRECT ANSWER EXPERIENCE

Incorrect responses should NEVER feel punitive.

Use:

* Gentle incorrect-state animation
* Selected answer visually identified
* Correct answer revealed
* Clear explanation

Example:

**Not quite — let's break it down.**

**Your answer:** C. Electrolyte replacement

**Correct answer:** B. Rapid fluid removal

Then explain WHY.

### Why?

Rapid ultrafiltration can decrease circulating volume before compensatory mechanisms respond.

### Clinical Insight

Blood pressure should not be evaluated alone. Symptoms, ultrafiltration rate, patient history, and volume status should be considered together.

### Remember

Think:

**Volume + Rate + Patient Response**

**Continue →**

The visual treatment should communicate:

"You've learned something."

Not:

"You failed."

---

# 9. MICRO-LEARNING SYSTEM

Every question should support structured educational feedback.

Where the existing content allows it, generate/use:

**Explanation**
Why the correct answer is correct.

**Why Your Answer Was Wrong**
Contextual explanation when applicable.

**Clinical Insight**
A deeper practical or professional insight related to the question.

**Key Takeaway / Remember**
A concise memorable principle.

Do not make these unnecessarily verbose.

They should be highly scannable.

Use visual hierarchy and small contextual icons rather than giant text boxes.

---

# 10. QUESTION PROGRESSION

After feedback appears, the primary CTA becomes:

**Continue →**

Transition smoothly to the next question.

Do not reload the entire page.

Use subtle horizontal/fade transitions between questions.

Preserve quiz state throughout.

Show progress clearly:

Question 6 of 10

and/or

`████████████░░░`

Do not expose future answers.

---

# 11. QUIZ STATE MANAGEMENT

Support:

* Current question
* Selected answer
* Submitted answer
* Correct/incorrect state
* Score
* Completed questions
* Remaining questions
* Attempt number
* Time taken
* Quiz completion
* Best score
* Previous attempts

Persist progress so refreshing the browser does not destroy an active quiz.

If a learner leaves mid-assessment, allow:

**Resume Quiz**

---

# 12. COMPLETION EXPERIENCE

Finishing the final question should feel meaningful.

Do NOT immediately show a static results table.

Create a short completion sequence.

Example:

Progress ring animates:

0 → 72 → 86 → **90%**

Then reveal:

**Module Complete**

Excellent work.

**90%**

9 / 10 Correct

**Expert**

+450 XP

**Top 12% of learners**

"You've demonstrated a strong understanding of dialysis machine operation and safety."

Use tasteful completion animation:

* Animated score ring
* Checkmark
* Soft particles/confetti
* Sequential metric reveals

Keep it sophisticated.

---

# 13. PERFORMANCE LEVELS

Implement configurable performance tiers.

Suggested starting system:

Below 60% — **Developing**

60–74% — **Competent**

75–89% — **Advanced**

90–99% — **Expert**

100% — **Mastery**

Do not hard-code these values deeply into components. Keep thresholds configurable.

Display the learner's tier prominently on results.

---

# 14. SCORING

Calculate and display:

* Percentage score
* Correct answers
* Incorrect answers
* Passing score
* Pass/fail status
* Attempt number
* Best score
* Improvement from previous attempt
* Optional time taken

Example:

**Assessment Performance**

Score
**87%**

Correct
**7 / 8**

Passing Score
**70%**

Personal Best
**92%**

Attempt
**#2**

---

# 15. RANKING / BENCHMARKING

Design the UI architecture for learner benchmarking.

Support:

* Course average
* Percentile
* Personal best
* Performance tier
* XP/points
* Optional leaderboard

Example:

**Your Performance**

92%

Course Average
78%

You performed better than
**86% of learners**

**Top 14%**

If real cohort data does not currently exist, DO NOT fabricate rankings.

Build the component and data structure so it can receive real ranking data later.

Use an explicit unavailable/hidden state when ranking data is missing.

---

# 16. XP / REWARD SYSTEM

Create a restrained professional reward system.

Possible XP events:

* Completing lesson
* Completing assessment
* Passing assessment
* High score
* Perfect score
* First-attempt pass
* Completing course

Possible achievements:

**First Assessment**

**First Attempt Pass**

**Perfect Score**

**Clinical Mastery**

**Course Complete**

Do not turn the platform into a game.

Rewards should provide motivation without undermining the professional healthcare education environment.

---

# 17. PERFORMANCE INSIGHTS

This is important.

Results should not only tell learners their score.

Analyze their responses and identify:

**Strong Areas**

**Areas to Review**

Example:

### Strong Areas

✓ Machine Setup
✓ Infection Control
✓ Patient Monitoring

### Recommended Review

→ Alarm Troubleshooting
→ Pressure Monitoring
→ Vascular Access Complications

Provide an action:

**Review Weak Areas →**

If possible, link these concepts back to the relevant lesson/module material.

---

# 18. ANSWER REVIEW

Create a complete review mode.

For each question display:

**Question 4**

What is a common cause of intradialytic hypotension?

A. Increased sodium intake
**B. Rapid fluid removal ✓ Correct**
C. Increased RBC production
**D. Infection — Your Answer**

Then show:

**Explanation**

**Clinical Insight**

**Key Takeaway**

Allow learners to navigate through all completed questions.

Answers cannot be changed in review mode.

---

# 19. RETAKES

Provide:

**Retake Assessment**

Retakes should create a new attempt while retaining previous results.

Track:

Attempt 1
Attempt 2
Attempt 3

Highlight:

**Personal Best**

Optionally randomize answer order between attempts.

Do not randomize if doing so could interfere with question logic.

---

# 20. MODULE COMPLETION

Once requirements are satisfied, clearly mark:

✓ Video Complete
✓ Assessment Complete
✓ Module Complete

Update overall course progress.

Example:

**5 of 8 Modules Complete**

`████████████████░░░░░`

Provide:

**Continue to Next Module →**

Also allow:

**Return to Course**

---

# 21. QUIZ RATING

After results/review, ask:

**How was this quiz?**

☆ ☆ ☆ ☆ ☆

Then:

**How was the difficulty?**

Too Easy
Just Right
Too Difficult

Optional:

"Anything we could improve?"

[Feedback field]

**Submit Feedback**

This interaction should be lightweight and skippable.

---

# 22. MODULE RATING

Separately ask:

**How useful was this module?**

☆ ☆ ☆ ☆ ☆

Optional feedback:

"What helped you most, or what could we improve?"

Do not combine quiz quality and educational module quality into one metric.

Store them separately.

---

# 23. COURSE COMPLETION

Completing the final module deserves a larger celebration than completing an individual question.

Create a premium course-completion state.

Possible sequence:

✓ Final module completed

Progress reaches 100%

Completion animation

Then:

**Course Complete**

"You've completed all learning modules and assessments."

Display:

Overall Course Score
Modules Completed
Average Quiz Score
Best Assessment
Total XP
Performance Level

Provide actions such as:

**View Course Summary**

**Review Modules**

If certification functionality exists or is planned:

**View Certificate**

Do not invent certificate functionality if it does not exist.

---

# 24. MOTION & MICROINTERACTIONS

Motion should make the product feel alive but never distract from learning.

Use restrained animations for:

* Answer selection
* Correct answer
* Incorrect answer
* Feedback expansion
* Progress updates
* Question transitions
* Score counting
* Progress rings
* Module completion
* Course completion
* Rating interaction
* Buttons
* Cards

Animations should generally be fast and responsive.

Prefer spring-based natural motion.

Avoid:

* Constant floating elements
* Excessive gradients
* Neon glows
* Huge confetti explosions
* Bouncing UI everywhere
* Cartoon animations
* Gratuitous 3D

Respect `prefers-reduced-motion`.

---

# 25. VISUAL DIRECTION

Create a **premium modern healthcare education interface**.

Use:

* Clean light surfaces
* Strong typography
* Generous whitespace
* Subtle borders
* Soft elevation
* Controlled corner radii
* Clear hierarchy
* Restrained use of brand/accent colors
* High readability

Avoid the stereotypical healthcare design of covering everything in blue gradients.

Color should primarily communicate:

Primary actions
Progress
Success
Warning
Incorrect/error
Information

Use semantic colors consistently.

Correct and incorrect states must NEVER depend solely on color.

Use:

✓ icons
✕ icons
labels
borders
text

for accessibility.

*(See 00-README-START-HERE.md Section 5 for the concrete token system implementing this direction.)*

---

# 26. LAYOUT

Desktop should make intelligent use of available screen space without stretching text excessively.

For learning pages, consider:

**Main Content**
Video / quiz / results

*

**Contextual Sidebar**
Course progress
Module navigation
Completion states

During an active quiz, simplify the environment and minimize distractions.

Mobile should collapse naturally into a focused single-column experience.

Do not simply shrink the desktop UI.

---

# 27. RESPONSIVENESS

Fully support:

* Desktop
* Laptop
* Tablet
* Mobile

Question cards must remain easy to tap.

Feedback content must remain readable.

Video must preserve appropriate aspect ratio.

Completion/results interfaces must reorganize intelligently on smaller screens.

---

# 28. ACCESSIBILITY

Build accessibility into the product from the beginning.

Support:

* Keyboard navigation
* Visible focus states
* Screen readers
* Semantic HTML
* ARIA where appropriate
* Accessible modal/dialog behavior
* Sufficient contrast
* Reduced motion
* Captions where available
* Large touch targets

Answer options should be usable as an accessible radio-group interaction while visually appearing as premium cards.

---

# 29. COMPONENT ARCHITECTURE

Do not build everything as one giant component.

Create reusable components such as:

CourseShell
CourseProgress
ModuleNavigation
LessonHeader
VideoLesson
VideoCompletion
QuizIntro
QuizProgress
QuestionCard
AnswerOption
AnswerFeedback
ClinicalInsight
KeyTakeaway
QuizCompletion
ScoreRing
PerformanceTier
PerformanceBreakdown
PerformanceInsights
RankingCard
AchievementCard
AnswerReview
RatingCard
ModuleRating
CourseCompletion

Names may differ if a better architecture makes sense.

The priority is reusable, maintainable composition.

---

# 30. DATA ARCHITECTURE

Separate educational content from presentation logic.

Quiz data should conceptually support:

* question
* options
* correctAnswer
* explanation
* clinicalInsight
* keyTakeaway
* topic/category
* difficulty

Learner state should separately support:

* selectedAnswer
* correctness
* attempt
* score
* timestamps
* completion
* ratings
* progress

Do not hard-code educational text directly throughout UI components when it can come from structured course data.

*(02-course-content-data.ts already implements this separation for the real content — extend its types rather than replacing them.)*

---

# 31. EXISTING CONTENT

IMPORTANT:

Inspect the existing project/context first.

Identify:

* Existing courses
* Modules
* Videos
* Quiz questions
* Correct answers
* Existing explanations
* Existing UI/components
* Existing brand system
* Existing routing
* Existing data structures

Reuse and extend them.

Do not replace functioning architecture unnecessarily.

Do not invent placeholder educational content when actual content already exists.

Where explanations/clinical insights are missing, derive concise educational reinforcement from the existing course material rather than introducing unrelated facts.

Because this concerns healthcare education, do not fabricate clinical claims merely to fill UI sections.

*(This audit has already been performed — see 00-README-START-HERE.md Section 1 for findings.)*

---

# 32. EMPTY / ERROR / EDGE STATES

Design the non-ideal states too.

Handle:

No answer selected
Video unavailable
Quiz unavailable
Progress loading
Network interruption
Submission failure
No ranking data
No previous attempts
No feedback yet
Assessment failed
Course incomplete
Resume existing attempt

Errors should provide a clear recovery action.

Example:

**We couldn't save your response.**

Your answer is still stored locally.

**Try Again**

*(This build has two real, non-hypothetical test cases for these states already: a module with no quiz at all, and courses with fewer modules than expected. Use them — don't just design the states in the abstract.)*

---

# 33. INTERACTION DETAILS

Pay attention to small product details.

Examples:

When an option is selected:

* border changes
* subtle background state
* radio indicator activates

When Check Answer is pressed:

* options lock
* correct answer becomes visible
* selected incorrect answer is identified
* feedback panel animates into view

When Continue is pressed:

* progress advances
* feedback collapses/transitions
* next question enters

When final answer is submitted:

* do not show normal Continue
* transition into completion sequence

When rating stars are hovered:

* preview rating

When submitted:

* show a lightweight confirmation

---

# 34. DO NOT DO

Do NOT:

* Build a generic quiz template
* Use placeholder lorem ipsum
* Overuse gradients
* Make everything cards inside cards
* Turn the product into a children's game
* Use huge amounts of confetti
* Make incorrect answers feel punitive
* Fabricate rankings
* Fabricate clinical information
* Hide important explanations behind unnecessary clicks
* Overload screens with statistics
* Add unnecessary dashboards just because they are common in LMS products
* Introduce dependencies without reason
* Rewrite existing working architecture unnecessarily

---

# 35. IMPLEMENTATION QUALITY

Build this as if it is going into production.

Prioritize:

* Clean architecture
* Reusable components
* Responsive design
* Smooth state transitions
* Accessibility
* Performance
* Maintainability
* Clear data flow
* Robust state handling
* Consistent visual system

Use the project's existing stack and conventions wherever possible.

If the project is Next.js, preserve the Next.js architecture.

Use the existing styling system where appropriate.

For animation, use the project's existing animation solution. If none exists and introducing one is justified, prefer a lightweight professional solution such as Framer Motion/Motion.

Do not introduce unnecessary libraries.

*(See 00-README-START-HERE.md Section 3 for the specific stack this greenfield build should use.)*

---

# 36. FIRST: AUDIT, THEN BUILD

Before changing code:

1. Inspect the entire relevant codebase.
2. Understand the existing course and quiz data.
3. Identify reusable components.
4. Identify the current design system.
5. Map the existing module/course relationships.
6. Determine what functionality already exists.
7. Create an implementation plan.
8. Then implement the experience systematically.

Do not blindly regenerate the application.

Preserve anything that already works well.

*(Steps 1–6 are already done — see 00-README-START-HERE.md Section 1. Step 7's plan is Section 4 of that same file. Proceed to step 8.)*

---

# 37. QUALITY BAR

The finished experience should feel like a thoughtfully designed digital learning product created specifically for professional education.

Every screen should answer:

**What am I learning?**

**Where am I in the course?**

**What should I do next?**

**What did I learn from this interaction?**

**How am I performing?**

The most important requirement is this:

> A learner who answers incorrectly should gain understanding, and a learner who answers correctly should still gain additional insight.

The assessment must therefore function simultaneously as:

**Evaluation + Reinforcement + Education + Motivation**

Do not stop at creating the minimum functional quiz.

Think through the complete user journey, identify missing states or interactions that would materially improve learning, and implement them when they fit the product.

Use the existing course content as the source of truth and build the complete experience around it.
