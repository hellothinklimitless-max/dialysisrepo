/**
 * DIALYSIS ACADEMY — REAL COURSE CONTENT DATA
 * ============================================
 * Source of truth for courses, modules, and quizzes. This is REAL content derived
 * from actual lesson transcripts and voiceover scripts already produced for this
 * project — nothing here is placeholder or invented course content.
 *
 * IMPORTANT NOTES BEFORE USING THIS FILE (see 00-README-START-HERE.md for full detail):
 *
 * 1. `durationLabel` / `durationSeconds` are ESTIMATES for layout purposes only.
 *    Fetch the real duration for each `videoUrl` via the YouTube oEmbed or Data API
 *    at build time and use that instead. Do not present these estimates as fact.
 *
 * 2. `clinicalInsight` fields were written conservatively, staying inside what each
 *    lesson's own source material states. They still need a real clinical review
 *    pass before this ships to real healthcare learners — see README section 2g.
 *
 * 3. Two questions sets are flagged with `flaggedForReview: true` — one because the
 *    original quiz format was open-response and was converted to multiple-choice
 *    (Course 1), one because the source content itself contains a genuine mismatch
 *    between its stated answer and its answer options (Course 3, Q4). Read each
 *    flagNote before shipping those questions as-is.
 *
 * 4. "Hemodialysis Machines" (Lesson 5) and a duplicate "Hemodialysis Fundamentals"
 *    video have NO transcript and are deliberately excluded — not stubbed.
 *
 * 5. "AKI, AKF, CKD" (module akiAkfCkd) has a real video but genuinely no quiz in
 *    its source material. Its `quiz` field is `null` on purpose — this is the
 *    real-world trigger for the "Quiz unavailable" edge state (brief Section 32).
 */

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export type Difficulty = "easy" | "medium" | "hard";

export type QuestionType = "single-best" | "conceptual-flagged";

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  topic: string;
  difficulty: Difficulty;
  question: string;
  /** Exactly four options, in A/B/C/D order. */
  options: [string, string, string, string];
  correctAnswerIndex: 0 | 1 | 2 | 3;
  /** Why the correct answer is correct — sourced from the lesson's own material. */
  explanation: string;
  /** A deeper practical insight, conservatively derived from the same lesson's content. NEEDS CLINICAL REVIEW — see file header. */
  clinicalInsight: string;
  /** A short, memorable one-line principle. */
  keyTakeaway: string;
  flaggedForReview?: boolean;
  flagNote?: string;
}

export interface QuizData {
  passingScore: number; // percent
  estimatedMinutes: number;
  questions: QuizQuestion[];
}

export type ContentStatus = "complete" | "missing-transcript";

export interface Module {
  id: string;
  moduleNumber: number;
  courseId: string;
  title: string;
  summary: string;
  videoUrl: string;
  videoProvider: "youtube";
  /** ESTIMATE ONLY — fetch real duration at build time. See file header note 1. */
  durationLabel: string;
  durationSeconds: number;
  durationIsEstimate: true;
  quiz: QuizData | null;
  contentStatus: ContentStatus;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  moduleIds: string[];
}

// Performance tiers — configurable, not hard-coded into components (brief Section 13).
export const PERFORMANCE_TIERS = [
  { id: "developing", label: "Developing", minPercent: 0, maxPercent: 59 },
  { id: "competent", label: "Competent", minPercent: 60, maxPercent: 74 },
  { id: "advanced", label: "Advanced", minPercent: 75, maxPercent: 89 },
  { id: "expert", label: "Expert", minPercent: 90, maxPercent: 99 },
  { id: "mastery", label: "Mastery", minPercent: 100, maxPercent: 100 },
] as const;

// ---------------------------------------------------------------------------
// COURSES
// ---------------------------------------------------------------------------

export const courses: Course[] = [
  {
    id: "dialysis-fundamentals",
    title: "Dialysis Fundamentals",
    description:
      "A 10-module course covering the essentials of dialysis care, from history and biology through patient assessment, home therapy, psychosocial support, and emerging technology.",
    moduleIds: [
      "introToDialysis",
      "akiAkfCkd",
      "hemodialysisBasics",
      "patientAssessment",
      "hemodialysisFundamentals",
      "psychosocialSupport",
      "homeHemodialysis",
      "innovationsInTech",
      "caseStudies",
    ],
    // Note: "Hemodialysis Machines" would sit between hemodialysisFundamentals and
    // psychosocialSupport in the original numbering, but has no transcript yet —
    // deliberately excluded rather than stubbed. See file header note 4.
  },
  {
    id: "advanced-dialysis-techniques",
    title: "Advanced Dialysis Techniques Explained",
    description:
      "A standalone deep-dive into advanced vascular access, machine troubleshooting, cutting-edge modalities, and advanced complication management.",
    moduleIds: ["advancedTechniques"],
  },
  {
    id: "dialysis-machines-explained",
    title: "Dialysis Machines Explained",
    description:
      "An engineering-focused breakdown of how hemodialysis machines work — pumps, filters, monitors, setup, troubleshooting, and safety.",
    moduleIds: ["machinesExplained"],
  },
  {
    id: "complications-in-dialysis",
    title: "Complications in Dialysis",
    description:
      "A focused course on recognizing and managing the most common dialysis complications — hypotension, hypertension, arrhythmias, and more.",
    moduleIds: ["complications"],
  },
  // "Course 4" was never provided in the source material and is not invented here.
];

// ---------------------------------------------------------------------------
// MODULES
// ---------------------------------------------------------------------------

export const modules: Module[] = [
  // =========================================================================
  // COURSE A — DIALYSIS FUNDAMENTALS
  // =========================================================================
  {
    id: "introToDialysis",
    moduleNumber: 1,
    courseId: "dialysis-fundamentals",
    title: "Introduction to Dialysis",
    summary:
      "Dialysis as a lifeline for kidney failure: its ancient roots, the 1940s invention of the artificial kidney, the two main dialysis types, vascular access, and the care team.",
    videoUrl: "https://youtu.be/avBzZzg9KaI",
    videoProvider: "youtube",
    durationLabel: "4:45",
    durationSeconds: 285,
    durationIsEstimate: true,
    contentStatus: "complete",
    quiz: {
      passingScore: 70,
      estimatedMinutes: 5,
      questions: [
        {
          id: "intro-q1",
          type: "single-best",
          topic: "History",
          difficulty: "easy",
          question:
            "What was a major milestone in the evolution of dialysis therapy?",
          options: [
            "The development of the first artificial kidney by William Kolff in the 1940s",
            "The invention of dialysis in the 1800s",
            "Ancient Egyptian herbal remedies, used alone",
            "A discovery made only in the 2000s",
          ],
          correctAnswerIndex: 0,
          explanation:
            "Key milestones include the development of the first artificial kidney by William Kolff in the 1940s and the introduction of hemodialysis as a clinical therapy in the 1960s.",
          clinicalInsight:
            "Kolff's original device used little more than a rotating wooden drum and cellophane tubing — the same diffusion principle still underlies every modern dialyzer membrane.",
          keyTakeaway: "Kolff, 1940s — the start of modern dialysis.",
          flaggedForReview: true,
          flagNote:
            "Original source question was open-response ('What are some key historical milestones...'); converted to 4-option format using this course's standard distractor pattern. Correct option and explanation are the original model answer, unchanged.",
        },
        {
          id: "intro-q2",
          type: "single-best",
          topic: "Modality Comparison",
          difficulty: "easy",
          question:
            "How does peritoneal dialysis differ from hemodialysis in terms of patient experience?",
          options: [
            "Peritoneal dialysis offers more flexibility since it can be done at home, while hemodialysis typically requires clinic visits three times a week",
            "There is no difference between the two",
            "Hemodialysis is always done at home",
            "Peritoneal dialysis requires daily hospital visits",
          ],
          correctAnswerIndex: 0,
          explanation:
            "Peritoneal dialysis offers more flexibility since it can be done at home, whereas hemodialysis typically requires visits to the clinic three times a week.",
          clinicalInsight:
            "Because peritoneal dialysis runs continuously or overnight using the body's own peritoneal membrane, it tends to avoid the sharper fluid and blood-pressure swings that can come with three-times-weekly hemodialysis sessions.",
          keyTakeaway: "Peritoneal = home flexibility; hemodialysis = clinic schedule.",
          flaggedForReview: true,
          flagNote: "Converted from open-response format — see intro-q1 note.",
        },
        {
          id: "intro-q3",
          type: "single-best",
          topic: "Vascular Access",
          difficulty: "medium",
          question:
            "What are some common complications associated with vascular access in hemodialysis patients?",
          options: [
            "Infection, thrombosis, and stenosis (narrowing of blood vessels)",
            "There are no common complications",
            "Only minor bruising, nothing else",
            "Complications only affect peritoneal dialysis patients",
          ],
          correctAnswerIndex: 0,
          explanation:
            "Complications such as infection, thrombosis, and stenosis are common and need to be monitored regularly.",
          clinicalInsight:
            "Regular checks for a strong thrill (vibration) and bruit (sound) at the access site are simple, routine ways to catch narrowing or clotting before it causes a failed session.",
          keyTakeaway: "Watch access sites for infection, clots, and narrowing.",
          flaggedForReview: true,
          flagNote: "Converted from open-response format — see intro-q1 note.",
        },
        {
          id: "intro-q4",
          type: "single-best",
          topic: "History",
          difficulty: "easy",
          question:
            "Which ancient civilizations are explored in the context of dialysis's roots, and what were their methods?",
          options: [
            "Ancient Egypt and Mesopotamia, using herbs, rituals, and spiritual practices",
            "Ancient Rome, using surgical filtration",
            "Ancient China, using acupuncture-based filtration",
            "No ancient civilization addressed kidney disease",
          ],
          correctAnswerIndex: 0,
          explanation:
            "Ancient Egypt and Mesopotamia are explored, where early treatments for kidney disease involved herbs, rituals, and spiritual practices.",
          clinicalInsight:
            "The Ebers Papyrus, one of the oldest surviving medical texts, is often cited as an early record of urinary and kidney-related disease — recognizing kidney problems long predates any real ability to treat them.",
          keyTakeaway: "Egypt & Mesopotamia — the earliest recorded kidney treatments.",
          flaggedForReview: true,
          flagNote: "Converted from open-response format — see intro-q1 note.",
        },
        {
          id: "intro-q5",
          type: "single-best",
          topic: "History",
          difficulty: "easy",
          question:
            "Who developed the first artificial kidney, and why is this significant in the history of dialysis?",
          options: [
            "William Kolff, in the 1940s — his invention is the basis for today's dialysis machines",
            "Marie Curie, in the early 1900s",
            "A modern biotech startup, in the 2010s",
            "No single inventor is credited",
          ],
          correctAnswerIndex: 0,
          explanation:
            "William Kolff developed the first artificial kidney in the 1940s, which revolutionized the treatment of kidney failure and is the basis for today's dialysis machines.",
          clinicalInsight:
            "Every hemodialysis machine in use today — however advanced — still performs the same core function Kolff's original drum did: moving blood past a semipermeable membrane to remove waste by diffusion.",
          keyTakeaway: "Kolff's 1940s design underlies every modern machine.",
          flaggedForReview: true,
          flagNote: "Converted from open-response format — see intro-q1 note.",
        },
        {
          id: "intro-q6",
          type: "single-best",
          topic: "Technology",
          difficulty: "easy",
          question:
            "What are some advancements in dialysis technology that have improved patient care?",
          options: [
            "Home dialysis machines, wearable devices, and telemedicine",
            "None — the technology hasn't changed since the 1940s",
            "Only changes to hospital architecture",
            "Advancements exist but haven't affected patient independence",
          ],
          correctAnswerIndex: 0,
          explanation:
            "Technological advancements like home dialysis machines, wearable devices, and telemedicine have made dialysis more flexible and patient-friendly.",
          clinicalInsight:
            "Shifting more dialysis into the home and community — rather than requiring a clinic visit — is one of the clearest trends across the whole field, echoed again in the Home Hemodialysis and Innovations modules later in this course.",
          keyTakeaway: "Home care, wearables, and telemedicine mean more independence.",
          flaggedForReview: true,
          flagNote: "Converted from open-response format — see intro-q1 note.",
        },
      ],
    },
  },

  {
    id: "akiAkfCkd",
    moduleNumber: 2,
    courseId: "dialysis-fundamentals",
    title: "Understanding Kidney Issues: AKI, AKF, and CKD",
    summary:
      "Acute kidney injury, acute kidney failure, and chronic kidney disease: how they differ, their mechanisms, signs, diagnosis, treatment, and prevention.",
    videoUrl: "https://youtu.be/PlEM_o59AE8",
    videoProvider: "youtube",
    durationLabel: "2:00",
    durationSeconds: 120,
    durationIsEstimate: true,
    contentStatus: "complete",
    // Deliberately null — this lesson's source transcript never included a quiz.
    // This is the real-world trigger case for the "Quiz unavailable" edge state.
    quiz: null,
  },

  {
    id: "hemodialysisBasics",
    moduleNumber: 3,
    courseId: "dialysis-fundamentals",
    title: "Hemodialysis Basics",
    summary:
      "From Kolff's 1940s machine to today's biocompatible membranes: the three biological principles behind hemodialysis, fluid balance, and hydration management.",
    videoUrl: "https://youtu.be/RMAEJEyRc-0",
    videoProvider: "youtube",
    durationLabel: "3:00",
    durationSeconds: 180,
    durationIsEstimate: true,
    contentStatus: "complete",
    quiz: {
      passingScore: 70,
      estimatedMinutes: 3,
      questions: [
        {
          id: "hdbasics-q1",
          type: "single-best",
          topic: "History",
          difficulty: "easy",
          question: "What are the historical origins of hemodialysis?",
          options: [
            "The 1940s, by Dr. Kolff",
            "An 1800s invention",
            "Modern only",
            "No history",
          ],
          correctAnswerIndex: 0,
          explanation:
            "The 1940s, by Dr. Kolff, who pioneered the first artificial kidney machine, marking the start of modern hemodialysis.",
          clinicalInsight:
            "Kolff built his first machine using wood and wrapped tubing — a reminder that the core diffusion principle didn't require advanced materials, only the right idea.",
          keyTakeaway: "Modern hemodialysis began with Kolff in the 1940s.",
        },
        {
          id: "hdbasics-q2",
          type: "single-best",
          topic: "Principles / Biology",
          difficulty: "medium",
          question: "What biological principles underpin hemodialysis?",
          options: [
            "Diffusion, ultrafiltration, and osmosis",
            "Just filtering",
            "Boiling the blood",
            "All manual",
          ],
          correctAnswerIndex: 0,
          explanation:
            "Diffusion, ultrafiltration, and osmosis, because these processes remove waste, clear excess fluid, and maintain balance across the dialyzer membrane.",
          clinicalInsight:
            "Diffusion moves waste out, ultrafiltration removes excess water under pressure, and osmosis restores balance — together they do the job three healthy kidney functions would otherwise perform.",
          keyTakeaway: "Diffusion + ultrafiltration + osmosis = the three pillars.",
        },
        {
          id: "hdbasics-q3",
          type: "single-best",
          topic: "Fluid Management",
          difficulty: "medium",
          question: "Why is optimal fluid balance crucial?",
          options: [
            "It prevents low blood pressure and lung problems",
            "No reason",
            "Only for weight",
            "Fun fact",
          ],
          correctAnswerIndex: 0,
          explanation:
            "It prevents low blood pressure and lung problems, because imbalances can lead to hypotension, pulmonary edema, and other complications.",
          clinicalInsight:
            "Tools like body composition scans and lung ultrasound can help spot fluid overload before it becomes symptomatic, letting the removal target be tailored per session.",
          keyTakeaway: "Fluid balance protects blood pressure and the lungs.",
        },
        {
          id: "hdbasics-q4",
          type: "single-best",
          topic: "Fluid Management / Hydration",
          difficulty: "medium",
          question: "How do you mitigate the risks of dehydration?",
          options: [
            "Hydration checks and patient education",
            "Ignore it",
            "More salt",
            "Skip sessions",
          ],
          correctAnswerIndex: 0,
          explanation:
            "Hydration checks and patient education, because monitoring blood pressure and electrolytes, plus teaching patients about restrictions, helps prevent problems during dialysis.",
          clinicalInsight:
            "Adjusting sodium levels or cooling the dialysate during a session are two practical, in-session tweaks that can ease strain when a patient is trending toward instability.",
          keyTakeaway: "Monitor + educate — both sides of dehydration prevention.",
        },
      ],
    },
  },

  {
    id: "patientAssessment",
    moduleNumber: 4,
    courseId: "dialysis-fundamentals",
    title: "Dialysis Patient Assessment",
    summary:
      "A whole-person approach to assessment: physical exam, labs and symptoms, vascular access checks, medical history, team coordination, and safety.",
    videoUrl: "https://youtu.be/EF26uPuhDBs",
    videoProvider: "youtube",
    durationLabel: "2:25",
    durationSeconds: 145,
    durationIsEstimate: true,
    contentStatus: "complete",
    quiz: {
      passingScore: 70,
      estimatedMinutes: 3,
      questions: [
        {
          id: "assess-q1",
          type: "single-best",
          topic: "Assessment Fundamentals",
          difficulty: "easy",
          question: "Why is patient assessment essential in dialysis care?",
          options: [
            "To evaluate physical and psychological status for tailored treatment",
            "Skip it",
            "Only labs matter",
            "It's just for fun",
          ],
          correctAnswerIndex: 0,
          explanation:
            "Evaluating physical and psychological status is essential because it informs decisions and optimizes outcomes holistically.",
          clinicalInsight:
            "Assessment isn't a one-time gate before treatment starts — it's evaluated continuously across body, mind, and kidney health so the plan can be tailored as the patient's needs change.",
          keyTakeaway: "Whole-person assessment drives a tailored plan.",
        },
        {
          id: "assess-q2",
          type: "single-best",
          topic: "Physical Exam",
          difficulty: "medium",
          question: "What are the key components of a physical exam?",
          options: [
            "Only blood work",
            "Just weight",
            "No exam needed",
            "Access sites, skin, fluid signs, and vitals",
          ],
          correctAnswerIndex: 3,
          explanation:
            "Access sites, skin, fluid signs, and vitals, because they detect issues like infection or imbalance early.",
          clinicalInsight:
            "Checking the access site for a strong pulse or flow, the skin for infection, and vitals like blood pressure and heart rate throughout the session are the fast, repeatable checks that catch problems before they escalate.",
          keyTakeaway: "Access, skin, fluid signs, vitals — the four-part physical exam.",
        },
        {
          id: "assess-q3",
          type: "single-best",
          topic: "Lab Values",
          difficulty: "medium",
          question: "What lab parameters are assessed?",
          options: [
            "Only temperature",
            "Creatinine, BUN, and electrolytes",
            "No labs needed",
            "Heart rate",
          ],
          correctAnswerIndex: 1,
          explanation:
            "Creatinine, BUN, and electrolytes, because they monitor kidney function, balance, and health risks.",
          clinicalInsight:
            "Watching for fatigue, swelling, and itching alongside these lab values connects the numbers to what the patient is actually experiencing — symptoms are often the earlier signal.",
          keyTakeaway: "Creatinine, BUN, electrolytes — the core lab trio.",
        },
        {
          id: "assess-q4",
          type: "single-best",
          topic: "Vascular Access",
          difficulty: "medium",
          question: "Why assess vascular access?",
          options: [
            "For fun",
            "Ignore it",
            "To ensure safe blood flow and prevent complications",
            "Only once",
          ],
          correctAnswerIndex: 2,
          explanation:
            "To ensure safe blood flow and prevent complications.",
          clinicalInsight:
            "Palpating for clots, using ultrasound for a clear view, and tracking flow rates are the specific techniques that catch narrowing or infection early enough to avoid a failed session.",
          keyTakeaway: "Vascular access checks prevent failed sessions.",
        },
      ],
    },
  },

  {
    id: "hemodialysisFundamentals",
    moduleNumber: 5,
    courseId: "dialysis-fundamentals",
    title: "Hemodialysis Fundamentals: History to Fluid Mastery",
    summary:
      "The dialyzer as a semipermeable membrane, fluid dynamics, hydration strategy, intradialytic techniques like sodium profiling, and biofeedback innovations.",
    videoUrl: "https://youtu.be/iJsFGnry4Cs",
    videoProvider: "youtube",
    durationLabel: "3:10",
    durationSeconds: 190,
    durationIsEstimate: true,
    contentStatus: "complete",
    quiz: {
      passingScore: 70,
      estimatedMinutes: 3,
      questions: [
        {
          id: "fund-q1",
          type: "single-best",
          topic: "History",
          difficulty: "easy",
          question: "What are the historical origins of hemodialysis?",
          options: [
            "Eighteen-hundreds natural remedies",
            "The 1940s, with Dr. Kolff's artificial kidney",
            "Two-thousands wearable technology",
            "Ancient herbal filters",
          ],
          correctAnswerIndex: 1,
          explanation:
            "The 1940s, with Dr. Kolff's artificial kidney, because his invention turned kidney failure from a fatal diagnosis into a treatable one, using little more than a drum and tubing.",
          clinicalInsight:
            "Today's biocompatible membranes and real-time monitors are direct descendants of that original drum-and-tubing design — the underlying principle hasn't changed, only the precision.",
          keyTakeaway: "1940s drum and tubing → today's precision membranes.",
        },
        {
          id: "fund-q2",
          type: "single-best",
          topic: "Principles / Biology",
          difficulty: "medium",
          question: "What biological principles underpin hemodialysis?",
          options: [
            "Boiling for sterilization",
            "Solute diffusion, ultrafiltration, and osmosis",
            "Gravity alone",
            "Electrical shocks",
          ],
          correctAnswerIndex: 1,
          explanation:
            "Solute diffusion, ultrafiltration, and osmosis, because together they replicate kidney function, removing waste and fluid across the membrane.",
          clinicalInsight:
            "The dialyzer's semipermeable membrane does all three jobs simultaneously during a single pass of blood — cleaning the blood through an access point such as an arteriovenous fistula.",
          keyTakeaway: "One membrane, three jobs: diffusion, ultrafiltration, osmosis.",
        },
        {
          id: "fund-q3",
          type: "single-best",
          topic: "Fluid Management",
          difficulty: "hard",
          question: "Why is optimal fluid balance crucial in hemodialysis?",
          options: [
            "For fun routines",
            "To prevent intradialytic hypotension and pulmonary edema",
            "To increase fluid overload",
            "To ignore vitals",
          ],
          correctAnswerIndex: 1,
          explanation:
            "To prevent intradialytic hypotension and pulmonary edema, because imbalances between fluid intake and fluid removal put patients at real risk.",
          clinicalInsight:
            "Tools like bioimpedance and ultrasound help spot fluid overload early, so the removal rate can be tailored to each patient rather than applied as a flat default.",
          keyTakeaway: "Balance intake against removal — both directions carry risk.",
        },
        {
          id: "fund-q4",
          type: "single-best",
          topic: "Fluid Management / Hydration",
          difficulty: "medium",
          question: "How can dehydration risks be mitigated?",
          options: [
            "Rigorous assessment, patient education, fluid restrictions, and sodium profiling",
            "Always more fluids",
            "Skip monitoring",
            "Hot dialysate",
          ],
          correctAnswerIndex: 0,
          explanation:
            "Rigorous assessment, education, restrictions, and sodium profiling, because blood pressure and electrolyte checks, along with careful adjustments, keep patients safe.",
          clinicalInsight:
            "Sodium profiling and cooler dialysate are two specific intradialytic adjustments that can ease strain and improve stability in real time during a session.",
          keyTakeaway: "Sodium profiling and cooler dialysate ease intradialytic strain.",
        },
      ],
    },
  },

  {
    id: "psychosocialSupport",
    moduleNumber: 6,
    courseId: "dialysis-fundamentals",
    title: "Psychosocial Support in Dialysis",
    summary:
      "Dialysis affects the mind as much as the body: psychological impact, stressors, relationship strain, cultural considerations, and integrated mental health care.",
    videoUrl: "https://youtu.be/0uynLJWkoHI",
    videoProvider: "youtube",
    durationLabel: "2:15",
    durationSeconds: 135,
    durationIsEstimate: true,
    contentStatus: "complete",
    quiz: {
      passingScore: 70,
      estimatedMinutes: 2,
      questions: [
        {
          id: "psych-q1",
          type: "single-best",
          topic: "Psychological Impact",
          difficulty: "easy",
          question: "What are the psychological impacts of dialysis?",
          options: [
            "Anxiety, depression, and fear from the challenges of treatment",
            "None",
            "Only physical effects",
            "Joy only",
          ],
          correctAnswerIndex: 0,
          explanation:
            "Anxiety, depression, and fear, because the shift in life circumstances brings real uncertainty that needs support.",
          clinicalInsight:
            "Recognizing these impacts early — at diagnosis, not just once treatment is underway — allows care to be tailored to how someone is actually coping, not just their clinical numbers.",
          keyTakeaway: "The diagnosis itself, not just treatment, drives real emotional impact.",
        },
        {
          id: "psych-q2",
          type: "single-best",
          topic: "Stressors",
          difficulty: "medium",
          question: "How do stressors typically show up?",
          options: [
            "Ignore them",
            "There are no stressors",
            "Only fun",
            "Frequency, diet, cost, and disruption, leading to fatigue and isolation",
          ],
          correctAnswerIndex: 3,
          explanation:
            "Frequency, diet, cost, and disruption, leading to fatigue and isolation — because these add a real mental toll that calls for active intervention.",
          clinicalInsight:
            "These stressors are ordinary and cumulative rather than dramatic, which is exactly why they can go unaddressed — a proactive plan to ease the burden matters as much as the treatment itself.",
          keyTakeaway: "Ordinary stressors compound quietly into fatigue and isolation.",
        },
        {
          id: "psych-q3",
          type: "single-best",
          topic: "Relationships",
          difficulty: "medium",
          question: "How does dialysis affect relationships?",
          options: [
            "No effect",
            "It improves everything",
            "It strains bonds and roles with family, friends, and caregivers",
            "It ends them",
          ],
          correctAnswerIndex: 2,
          explanation:
            "It strains bonds and roles with family, friends, and caregivers — illness shifts the dynamics at home, and it takes communication to keep that support intact.",
          clinicalInsight:
            "Open conversation is specifically what turns coping into something shared rather than solitary — the strain is real, but it responds to communication rather than being fixed or permanent.",
          keyTakeaway: "Communication is what keeps strained support intact.",
        },
      ],
    },
  },

  {
    id: "homeHemodialysis",
    moduleNumber: 7,
    courseId: "dialysis-fundamentals",
    title: "Home Hemodialysis Programs",
    summary:
      "Frequent home sessions for complex needs, suitability across every age group including AKI recovery, comorbidity management, and emerging home-therapy technology.",
    videoUrl: "https://youtu.be/Aia9OEOKiyg",
    videoProvider: "youtube",
    durationLabel: "2:15",
    durationSeconds: 135,
    durationIsEstimate: true,
    contentStatus: "complete",
    quiz: {
      passingScore: 70,
      estimatedMinutes: 2,
      questions: [
        {
          id: "home-q1",
          type: "single-best",
          topic: "Home Therapy Benefits",
          difficulty: "medium",
          question:
            "What's a key benefit of frequent home hemodialysis for patients with complex needs?",
          options: [
            "Fewer sessions",
            "No benefit",
            "Hospital-only care",
            "Flexibility and control over fluid management, improving outcomes",
          ],
          correctAnswerIndex: 3,
          explanation:
            "Flexibility and control over fluid management, improving outcomes — frequent home sessions tailor to complex needs, improving control and reducing burden.",
          clinicalInsight:
            "For patients with heart issues or diabetes, more frequent (rather than fewer) sessions at home give better control over toxins and fluid than a standard clinic schedule — flexibility here means more sessions, not less monitoring.",
          keyTakeaway: "More frequent home sessions, not fewer, drive the benefit.",
        },
        {
          id: "home-q2",
          type: "single-best",
          topic: "Fluid Management",
          difficulty: "medium",
          question: "How does home hemodialysis ensure gentle fluid removal?",
          options: [
            "Custom slow removal rates, education, and monitoring for stability",
            "Rapid removal only",
            "No fluid management",
            "Ignore it",
          ],
          correctAnswerIndex: 0,
          explanation:
            "Custom slow removal rates, education, and monitoring for stability — gradual removal minimizes drops in pressure, which especially suits older patients with heart conditions.",
          clinicalInsight:
            "This connects directly to why home therapy suits older patients with stiffened arteries or heart conditions: the slower, more frequent removal schedule is gentler on the cardiovascular system than a standard three-times-weekly clinic rate.",
          keyTakeaway: "Slower, more frequent removal is gentler on the heart.",
        },
        {
          id: "home-q3",
          type: "single-best",
          topic: "Recovery / AKI",
          difficulty: "medium",
          question:
            "Is home hemodialysis ideal for patients recovering from acute kidney injury, across all ages?",
          options: [
            "Yes, it's personalized and flexible for recovery across ages",
            "No",
            "Only for children",
            "Hospital care is always better",
          ],
          correctAnswerIndex: 0,
          explanation:
            "Yes — it's personalized and flexible for recovery across ages, because early home therapy empowers patients and adapts to their needs, supporting better healing.",
          clinicalInsight:
            "Home hemodialysis fits nearly every stage of life, from children to seniors — starting early after an AKI diagnosis is specifically what speeds healing, and a personalized plan is what boosts how well patients stick with treatment.",
          keyTakeaway: "Early, personalized home therapy speeds AKI recovery.",
        },
      ],
    },
  },

  {
    id: "innovationsInTech",
    moduleNumber: 8,
    courseId: "dialysis-fundamentals",
    title: "Innovations in Dialysis Technology",
    summary:
      "Wearable and implantable devices, remote telemedicine and telenephrology, AI/ML-driven predictive care, and emerging 2025-era trends like decentralized care.",
    videoUrl: "https://youtu.be/cqlaW8DZJ-0",
    videoProvider: "youtube",
    durationLabel: "2:45",
    durationSeconds: 165,
    durationIsEstimate: true,
    contentStatus: "complete",
    quiz: {
      passingScore: 70,
      estimatedMinutes: 3,
      questions: [
        {
          id: "innov-q1",
          type: "single-best",
          topic: "Wearable Technology",
          difficulty: "easy",
          question:
            "What are wearable dialysis devices, and how do they impact care delivery?",
          options: [
            "Bulky",
            "Clinic-only",
            "No impact",
            "Compact and portable for home use, offering flexibility and autonomy",
          ],
          correctAnswerIndex: 3,
          explanation:
            "Compact and portable for home use, offering flexibility and autonomy — because they allow on-the-go therapy, reducing constraints and improving quality of life.",
          clinicalInsight:
            "Compact, portable systems and implantable designs from ongoing research efforts aim to mimic the kidneys' function on the go — wireless and lightweight, specifically to reduce how often patients need to visit a clinic.",
          keyTakeaway: "Wearable/implantable devices trade clinic visits for daily freedom.",
        },
        {
          id: "innov-q2",
          type: "single-best",
          topic: "Membrane Technology",
          difficulty: "medium",
          question: "What are the key advantages of nanomembranes?",
          options: [
            "None",
            "Enhanced permeability, selectivity, and biocompatibility",
            "They make things worse",
            "They're bulky",
          ],
          correctAnswerIndex: 1,
          explanation:
            "Enhanced permeability, selectivity, and biocompatibility — because nanoscale engineering improves waste removal while minimizing the loss of nutrients the body needs.",
          clinicalInsight:
            "Selectivity is the key word here: a nanomembrane isn't just letting more through, it's being more precise about what leaves the blood — removing waste more thoroughly while holding onto nutrients the body needs to keep.",
          keyTakeaway: "Nanomembranes are more selective, not just more permeable.",
        },
        {
          id: "innov-q3",
          type: "single-best",
          topic: "Telemedicine",
          difficulty: "medium",
          question: "How does remote telemedicine benefit patients?",
          options: [
            "Virtual consultations and monitoring for proactive, personalized care",
            "It increases visits",
            "No benefit",
            "It complicates things",
          ],
          correctAnswerIndex: 0,
          explanation:
            "Virtual consultations and monitoring for proactive, personalized care — because they enable real-time adjustments and reduce hospitalizations.",
          clinicalInsight:
            "Telenephrology specifically is helping bring dialysis support to rural areas that have historically struggled with access — the benefit isn't just convenience, it's genuine reach into underserved regions.",
          keyTakeaway: "Telenephrology extends dialysis support into underserved areas.",
        },
      ],
    },
  },

  {
    id: "caseStudies",
    moduleNumber: 9,
    courseId: "dialysis-fundamentals",
    title: "Case Studies in Dialysis Care",
    summary:
      "Two real-world scenarios — vascular access thrombosis and intradialytic hypotension — showing recognition, teamwork, and intervention in practice.",
    videoUrl: "https://youtu.be/bZ2l2kfzDlE",
    videoProvider: "youtube",
    durationLabel: "2:30",
    durationSeconds: 150,
    durationIsEstimate: true,
    contentStatus: "complete",
    quiz: {
      passingScore: 70,
      estimatedMinutes: 2,
      questions: [
        {
          id: "case-q1",
          type: "single-best",
          topic: "Case-Based Learning",
          difficulty: "easy",
          question: "What's the purpose of studying real cases like these?",
          options: [
            "To explore real principles, management, and problem-solving",
            "Basics only",
            "No cases needed",
            "Just history",
          ],
          correctAnswerIndex: 0,
          explanation:
            "To explore real principles, management, and problem-solving — cases apply theory to real settings, giving practical insight you can't get any other way.",
          clinicalInsight:
            "Both cases in this lesson resolve because of the same three things: recognizing the problem quickly, working as a team, and involving the patient in their own care — that pattern generalizes well beyond these two specific scenarios.",
          keyTakeaway: "Recognition + teamwork + patient involvement = good outcomes.",
        },
        {
          id: "case-q2",
          type: "single-best",
          topic: "Vascular Access",
          difficulty: "medium",
          question: "What was the issue with the first patient's condition?",
          options: [
            "End-stage kidney disease with a swollen, painful, poorly-flowing fistula",
            "No issue",
            "Chronic kidney disease only",
            "Low blood pressure",
          ],
          correctAnswerIndex: 0,
          explanation:
            "End-stage kidney disease with a swollen, painful, poorly-flowing fistula — the clotting was blocking his access, and it needed an urgent fix.",
          clinicalInsight:
            "A swollen, painful access site with reduced flow is a classic presentation of thrombosis — recognizing this pattern quickly is what allowed the team to intervene before the session had to be delayed or cancelled.",
          keyTakeaway: "Swollen + painful + poor flow at the access site → suspect clotting.",
        },
        {
          id: "case-q3",
          type: "single-best",
          topic: "Clinical Intervention",
          difficulty: "medium",
          question: "What was the intervention?",
          options: [
            "Wait and see",
            "Ultrasound-guided clot removal, education, anti-clotting medication, and monitoring",
            "Skip dialysis",
            "Medication alone",
          ],
          correctAnswerIndex: 1,
          explanation:
            "Ultrasound-guided clot removal, education, anti-clotting medication, and monitoring — this combination restores flow and prevents future clots through real teamwork.",
          clinicalInsight:
            "Notice the intervention doesn't stop at restoring flow — it pairs the procedure with patient education and anti-clotting medication specifically to prevent recurrence, not just to fix the immediate problem.",
          keyTakeaway: "Fix the immediate problem, then address why it happened.",
        },
      ],
    },
  },

  // =========================================================================
  // COURSE B — ADVANCED DIALYSIS TECHNIQUES EXPLAINED (standalone)
  // =========================================================================
  {
    id: "advancedTechniques",
    moduleNumber: 1,
    courseId: "advanced-dialysis-techniques",
    title: "Advanced Dialysis Techniques Explained",
    summary:
      "Advanced vascular access (fistulas & grafts), machine troubleshooting, cutting-edge modalities (hemodiafiltration, nocturnal, wearables), and advanced complications.",
    videoUrl: "https://youtu.be/JiK3MzjsPX4",
    videoProvider: "youtube",
    durationLabel: "3:30",
    durationSeconds: 210,
    durationIsEstimate: true,
    contentStatus: "complete",
    quiz: {
      passingScore: 70,
      estimatedMinutes: 3,
      questions: [
        {
          id: "adv-q1",
          type: "single-best",
          topic: "Program Purpose",
          difficulty: "easy",
          question: "What is the purpose of advanced dialysis techniques?",
          options: [
            "Basic concepts",
            "Advanced procedures and technology",
            "History",
            "Patient tips",
          ],
          correctAnswerIndex: 1,
          explanation: "Advanced procedures and technologies in dialysis.",
          clinicalInsight:
            "This course builds directly on the fundamentals course — advanced vascular access, machine troubleshooting, and newer modalities like hemodiafiltration all assume the basic biology and mechanics are already understood.",
          keyTakeaway: "Advanced techniques build on — don't replace — the fundamentals.",
        },
        {
          id: "adv-q2",
          type: "single-best",
          topic: "Program Goals",
          difficulty: "easy",
          question: "What's the second goal of the program?",
          options: [
            "Discourage careers",
            "Equip professionals with advanced skills",
            "Limit technology",
            "Basics over advanced",
          ],
          correctAnswerIndex: 1,
          explanation:
            "To equip healthcare professionals with advanced knowledge and skills in dialysis.",
          clinicalInsight:
            "The course explicitly mixes lectures, real stories, hands-on labs, simulations, and group discussion — that variety of formats is itself part of how advanced skills are meant to be built, not just delivered as reading material.",
          keyTakeaway: "Skills are built through practice, not just information.",
        },
        {
          id: "adv-q3",
          type: "single-best",
          topic: "Scope of Practice",
          difficulty: "easy",
          question: "Who benefits from this training?",
          options: [
            "Only doctors",
            "Only nurses",
            "Only technicians",
            "Everyone in renal care",
          ],
          correctAnswerIndex: 3,
          explanation: "All healthcare professionals involved in renal care.",
          clinicalInsight:
            "The advanced complications section of this course — disequilibrium, potassium management, access-site care — depends on coordinated recognition across roles, which is exactly why the training isn't limited to one profession.",
          keyTakeaway: "Advanced complications need coordinated, cross-role recognition.",
        },
        {
          id: "adv-q4",
          type: "single-best",
          topic: "Program Focus",
          difficulty: "easy",
          question: "What's the main focus?",
          options: [
            "Basic anatomy",
            "Fundamental principles",
            "Advanced procedures and technology",
            "General practices",
          ],
          correctAnswerIndex: 2,
          explanation: "Advanced procedures and technologies in dialysis.",
          clinicalInsight:
            "Hemodiafiltration, nocturnal dialysis, and wearable devices are presented together in this course specifically as the current frontier of the field, worth understanding as a set rather than in isolation.",
          keyTakeaway: "Hemodiafiltration, nocturnal, and wearables: the current frontier.",
        },
        {
          id: "adv-q5",
          type: "single-best",
          topic: "Program Goals",
          difficulty: "medium",
          question: "Which of these is not a goal?",
          options: [
            "Enhance outcomes",
            "Deepen understanding",
            "Promote outdated methods",
            "Improve skills",
          ],
          correctAnswerIndex: 2,
          explanation:
            "This program is not about promoting outdated dialysis methods.",
          clinicalInsight:
            "The course's own framing — 'beyond the basics,' 'cutting-edge methods' — is a direct statement that its purpose is staying current, not preserving legacy practice for its own sake.",
          keyTakeaway: "The program's whole premise is staying current, not preserving legacy practice.",
        },
      ],
    },
  },

  // =========================================================================
  // COURSE C — DIALYSIS MACHINES EXPLAINED (standalone)
  // =========================================================================
  {
    id: "machinesExplained",
    moduleNumber: 1,
    courseId: "dialysis-machines-explained",
    title: "Dialysis Machines Explained",
    summary:
      "An engineering teardown: pumps, filters, and monitors; setup and priming; running a session; troubleshooting alarms; safety and quality.",
    videoUrl: "https://youtu.be/bmdxcwuWv6Y",
    videoProvider: "youtube",
    durationLabel: "3:15",
    durationSeconds: 195,
    durationIsEstimate: true,
    contentStatus: "complete",
    quiz: {
      passingScore: 70,
      estimatedMinutes: 3,
      questions: [
        {
          id: "mach-q1",
          type: "single-best",
          topic: "Machine Components",
          difficulty: "easy",
          question:
            "What is the purpose of looking closely at the components of a dialysis machine?",
          options: [
            "To understand how the components work together",
            "To appreciate the engineering",
            "To regulate fluid flow",
            "To purify the blood",
          ],
          correctAnswerIndex: 0,
          explanation:
            "To understand how the components work together, because that's what makes sense of the whole machine.",
          clinicalInsight:
            "The lesson covers two real machine families by design — a lightweight, portable system built for home setups, and a more feature-dense system built for clinics — precisely because understanding the shared components makes both easier to operate.",
          keyTakeaway: "Shared components, different form factors: home vs. clinic machines.",
        },
        {
          id: "mach-q2",
          type: "single-best",
          topic: "Pumps",
          difficulty: "easy",
          question: "Which component regulates fluid flow?",
          options: [
            "The pumps",
            "The filtration system",
            "The blood purifiers",
            "The tubing",
          ],
          correctAnswerIndex: 0,
          explanation:
            "The pumps, which create the push that moves blood and fluid at just the right rate.",
          clinicalInsight:
            "Pumps and filters work as a pair — the pump sets the pace, the filter does the sorting (keeping the good things in the blood while drawing toxins out) — so a problem in one often shows up as a symptom in the other.",
          keyTakeaway: "Pumps set the pace; filters do the sorting.",
        },
        {
          id: "mach-q3",
          type: "single-best",
          topic: "Learning Methods",
          difficulty: "easy",
          question: "How do you best gain insight into the inner workings?",
          options: [
            "Theoretical lectures",
            "Visual aids and interactive demonstrations",
            "Written assessments",
            "Group discussions",
          ],
          correctAnswerIndex: 1,
          explanation:
            "Visual aids and interactive demonstrations, because seeing the machine in action makes it click.",
          clinicalInsight:
            "This is a direct statement about how this content should be taught — it's part of why this course pairs its lesson video with hands-on simulation practice rather than lecture alone.",
          keyTakeaway: "Seeing the machine work beats reading about it.",
        },
        {
          id: "mach-q4",
          type: "conceptual-flagged",
          topic: "Machine Components",
          difficulty: "medium",
          question: "What is the backbone of a dialysis machine?",
          options: [
            "The pumps",
            "The filtration system",
            "The blood purifiers",
            "The tubing",
          ],
          correctAnswerIndex: 0,
          explanation:
            "This one's a bit of a trick — it's really all the components working together, but the pumps and filters are the key players.",
          clinicalInsight:
            "The lesson explicitly frames this as a trick question because no single component works in isolation — the point being taught is the interplay between pumps, filters, and monitors, not any one part in isolation.",
          keyTakeaway: "No single part is the backbone — the system is.",
          flaggedForReview: true,
          flagNote:
            "The source material's stated answer ('it's really all the components together, but pumps and filters are key') does not cleanly map to any single one of the four given options (pumps / filtration / blood purifiers / tubing) — there is no 'all of the above' option in the original script. correctAnswerIndex is set to 0 (pumps) as a pragmatic default since pumps are named first in the stated answer, but this is a genuine content defect inherited from the source, not a confident single answer. Recommend rendering `type: 'conceptual-flagged'` questions with the explanation-first framing already written, rather than forcing a strict right/wrong selection UI. See 00-README-START-HERE.md section 2e.",
        },
        {
          id: "mach-q5",
          type: "single-best",
          topic: "Engineering Rationale",
          difficulty: "easy",
          question: "And why appreciate the engineering?",
          options: [
            "To impress colleagues",
            "To boost theoretical knowledge",
            "To understand how the machine works",
            "To become a certified technician",
          ],
          correctAnswerIndex: 2,
          explanation:
            "To understand how the machine works, which is what makes you better at using it.",
          clinicalInsight:
            "This closes the loop with mach-q1 — understanding isn't the end goal, it's in service of safer, faster troubleshooting when an alarm sounds for something like a clog or a drop in flow.",
          keyTakeaway: "Understanding the machine makes you faster at fixing it.",
        },
      ],
    },
  },

  // =========================================================================
  // COURSE D — COMPLICATIONS IN DIALYSIS (standalone)
  // =========================================================================
  {
    id: "complications",
    moduleNumber: 1,
    courseId: "complications-in-dialysis",
    title: "Complications in Dialysis",
    summary:
      "Recognizing and managing hypotension, hypertension, arrhythmias, access issues, electrolyte imbalances, and disequilibrium syndrome — grounded in pathophysiology.",
    videoUrl: "https://youtu.be/QFJwRQsuJzE",
    videoProvider: "youtube",
    durationLabel: "3:00",
    durationSeconds: 180,
    durationIsEstimate: true,
    contentStatus: "complete",
    quiz: {
      passingScore: 70,
      estimatedMinutes: 3,
      questions: [
        {
          id: "comp-q1",
          type: "single-best",
          topic: "Complication Types",
          difficulty: "easy",
          question: "What are some common complications during dialysis?",
          options: [
            "Low blood pressure",
            "High blood pressure",
            "Irregular heartbeats",
            "All of the above",
          ],
          correctAnswerIndex: 3,
          explanation:
            "All of the above, because they span hemodynamic, access, and biochemical issues that demand a comprehensive approach.",
          clinicalInsight:
            "This course groups complications into three families — hemodynamic (blood pressure, heart rhythm), access-related (clotting, infection), and biochemical (electrolytes, disequilibrium) — which is a useful mental model for the rest of the material.",
          keyTakeaway: "Three families: hemodynamic, access, biochemical.",
        },
        {
          id: "comp-q2",
          type: "single-best",
          topic: "Complication Types",
          difficulty: "medium",
          question: "Which of these is not a potential complication?",
          options: [
            "Low blood pressure",
            "Headache",
            "Clotting",
            "Irregular heartbeats",
          ],
          correctAnswerIndex: 1,
          explanation:
            "Headache — because while it's possible, it isn't a core complication tied directly to the treatment mechanism the way the others are.",
          clinicalInsight:
            "This distinction matters clinically: the other three options are directly mechanistic (they arise from what dialysis is physically doing to blood volume, pressure, and rhythm), while a headache is a nonspecific symptom that could stem from many causes.",
          keyTakeaway: "Nonspecific symptoms differ from mechanism-driven complications.",
        },
        {
          id: "comp-q3",
          type: "single-best",
          topic: "Pathophysiology",
          difficulty: "medium",
          question: "What's the cornerstone of understanding complications?",
          options: [
            "Risk factors",
            "Pathophysiology",
            "Treatment protocols",
            "Patient compliance",
          ],
          correctAnswerIndex: 1,
          explanation:
            "Pathophysiology, because it reveals the underlying process, like fluid shifts, that guides a targeted fix.",
          clinicalInsight:
            "This is why the course structures each complication around its mechanism first (e.g., hypotension from fluid shifts or autonomic issues) before covering recognition and treatment — the mechanism is what makes the fix targeted rather than generic.",
          keyTakeaway: "Understand the mechanism first — the fix follows from it.",
        },
        {
          id: "comp-q4",
          type: "single-best",
          topic: "Hypotension Mechanisms",
          difficulty: "hard",
          question:
            "Which factors contribute to low blood pressure during dialysis?",
          options: [
            "Fluid shifts",
            "Electrolyte imbalances",
            "Autonomic dysfunction",
            "All of the above",
          ],
          correctAnswerIndex: 3,
          explanation:
            "All of the above, because they interact together, guiding a personalized intervention.",
          clinicalInsight:
            "Because these factors interact rather than acting independently, the course's diagnostic toolkit for hypotension (labs, electrolyte panels, hands-on simulation) is deliberately broad rather than a single test.",
          keyTakeaway: "Hypotension is multi-factor — diagnosis should be too.",
        },
        {
          id: "comp-q5",
          type: "single-best",
          topic: "Hypertension Mechanisms",
          difficulty: "hard",
          question: "What may cause hypertension in dialysis?",
          options: [
            "Volume overload",
            "Activation of the renin-angiotensin-aldosterone system",
            "Sympathetic overactivity",
            "All of the above",
          ],
          correctAnswerIndex: 3,
          explanation:
            "All of the above, driving the rise in pressure that tailored blood pressure management addresses.",
          clinicalInsight:
            "Risk factors like diabetes, hypertension itself, and lifestyle all shape how likely these mechanisms are to activate — which is why interventions in this course are framed as needing to be tailored to the individual rather than standardized.",
          keyTakeaway: "Multiple mechanisms mean tailored management, not a standard protocol.",
        },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// CONVENIENCE LOOKUPS
// ---------------------------------------------------------------------------

export function getModuleById(id: string): Module | undefined {
  return modules.find((m) => m.id === id);
}

export function getCourseById(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

export function getModulesForCourse(courseId: string): Module[] {
  const course = getCourseById(courseId);
  if (!course) return [];
  return course.moduleIds
    .map((id) => getModuleById(id))
    .filter((m): m is Module => Boolean(m));
}
