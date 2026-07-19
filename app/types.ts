export enum Role {
    ADMIN = "ADMIN",
    STUDENT = "STUDENT",
    TENTOR = "TENTOR"
}

export enum ClassProgram {
    UTBK = "UTBK",
    SKD = "SKD"
}

export enum Status {
    INCOMPLETED = "INCOMPLETED",
    COMPLETED = "COMPLETED"
}

export enum Difficulty {
    HARD = "HARD",
    MEDIUM = "MEDIUM",
    EASY = "EASY"
}

export interface IAdmin {
    idAdmin: number
    uuid: string
    username: string
    password: string
    email: string
    role: Role
    phone_number: string
    created_at: Date
    updated_at: Date
}

export interface IUser {
    idUser: number
    uuid: string
    userName: string
    password: string
    full_name: string
    email: string
    role: Role
    classId: number
    phone_number: string
    parent_full_name: string
    parent_phone_number: string
    created_at: Date
    updated_at: Date

    class?: IClasses
    scores?: IScores[]
    answers?: IAnswers[]
    attempt?: IAttempt[]
}

export interface IClasses {
    idClass: number
    uuid: string
    class_name: string
    class_program?: ClassProgram | null
    created_at: Date
    updated_at: Date

    user?: IUser[]
    subjectClass?: ISubjectClass[]
}

export interface ISubject {
    idSubject: number
    uuid: string
    subject_name: string
    created_at: Date
    updated_at: Date

    subjectClass?: ISubjectClass[]
    quiz?: IQuiz[]
}

export interface ISubjectClass {
    subjectId: number
    classId: number

    subject?: ISubject
    class?: IClasses
}

export interface IQuiz {
    idQuiz: number
    uuid: string
    quiz_title: string
    quiz_date: Date
    duration: number
    status: Status
    difficulty: Difficulty

    created_by?: number | null
    creator_role?: Role | null

    subjectId?: number | null

    created_at: Date
    updated_at: Date

    subject?: ISubject

    scores?: IScores[]
    answers?: IAnswers[]
    questions?: IQuestions[]
    attempt?: IAttempt[]
}

export interface IAttempt {
    idAttempt: number
    userId: number
    quizId: number

    start_time: Date
    finished_time?: Date | null
    isFinished: boolean

    created_at: Date

    user?: IUser
    quiz?: IQuiz
}

export interface IScores {
    idScore: number
    uuid: string
    total_questions: number
    corret: number
    wrong: number
    score: number

    start_time: Date
    finished_time: Date

    created_at: Date
    updated_at: Date

    userId: number
    quizId: number

    user?: IUser
    quiz?: IQuiz
}

export interface IAnswers {
    idAnswers: number
    uuid: string
    student_answer: string
    answered_at: Date

    quizId: number
    userId: number
    questionsId: number
    optionsId: number

    quiz?: IQuiz
    user?: IUser
    questions?: IQuestions
    options?: IOptions
}

export interface IQuestions {
    idQuestion: number
    uuid: string
    question_text: string
    question_image: string
    difficulty: Difficulty
    poin: number

    quizId: number

    quiz?: IQuiz
    options?: IOptions[]
    answers?: IAnswers[]
}

export interface IOptions {
    idOption: number
    uuid: string
    option_text: string
    option_image: string
    is_correct: boolean

    questionsId: number

    questions?: IQuestions
    answers?: IAnswers[]
}

export interface IStudentLeaderboard {
    id: string;
    name: string
    avatar?: string;
    point: number;
    rank: number;
    isCurrentUser?: boolean;
}

export type TSubject = {
    id: string;
    name: string;
    teacher: string;
    totalQuiz: number;
    progress: number;
    description: string;
    color: "blue" | "mint" | "yellow" | "purple" | "pink";
}

export interface IRecentActivity {
    id: string;
    student: string;
    avatar?: string;
    subject: string;
    className: string;
    duration: number;
    score: number;
    completedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT — COMPOSITE TYPES (mirroring API response shapes)
// ─────────────────────────────────────────────────────────────────────────────

/** Quiz status dari perspektif student — derived dari attempt + scores */
export type QuizStudentStatus =
    | "NOT_STARTED"
    | "IN_PROGRESS"
    | "COMPLETED";

/** Quiz card data untuk halaman Subject Detail */
export interface IStudentQuizCard {
    uuid: string;
    quiz_title: string;
    difficulty: Difficulty;
    duration: number;              // minutes
    total_questions: number;
    quiz_date: string;             // ISO string
    student_status: QuizStudentStatus;
    // Null jika belum dikerjakan
    last_score: number | null;
    last_correct: number | null;
    last_wrong: number | null;
    // Null jika belum ada attempt
    attempt_id: number | null;
    is_finished: boolean;
}

/** Subject dengan quiz list dan progress student */
export interface IStudentSubject {
    uuid: string;
    subject_name: string;
    total_quiz: number;
    completed_quiz: number;
    average_score: number;
    completion_percentage: number; // 0-100
    estimated_time: number;        // total menit semua quiz
    quizzes: IStudentQuizCard[];
}

/** Summary subject untuk subject list page */
export interface IStudentSubjectSummary {
    uuid: string;
    subject_name: string;
    total_quiz: number;
    completed_quiz: number;
    average_score: number;
    completion_percentage: number;
}

/** Dashboard summary response dari GET /student/dashboard */
export interface IStudentDashboard {
    student: {
        uuid: string;
        full_name: string;
        userName: string;
        photoProfile: string;
        class_name: string;
        class_program: string | null;
    };
    stats: {
        average_score: number;
        weekly_progress: number;      // % improvement this week
        current_rank: number;
        current_streak: number;       // consecutive days
        completed_quiz: number;
        remaining_quiz: number;
        average_accuracy: number;     // %
        time_spent: number;           // total menit
    };
    strongest_subject: {
        subject_name: string;
        average_score: number;
    } | null;
    weakest_subject: {
        subject_name: string;
        average_score: number;
    } | null;
    recent_quizzes: IRecentQuizItem[];
    in_progress_quizzes: IInProgressQuizItem[];
    subject_mastery: ISubjectMasteryItem[];
    weekly_scores: IWeeklyScoreItem[];
    recent_activities: IStudentActivityItem[];
}

/** Item quiz yang sudah dikerjakan (recent) */
export interface IRecentQuizItem {
    quiz_uuid: string;
    quiz_title: string;
    subject_name: string;
    score: number;
    correct: number;
    wrong: number;
    total_questions: number;
    difficulty: Difficulty;
    finished_time: string;         // ISO string
    duration_used: number;         // menit
}

/** Item quiz yang sedang in progress */
export interface IInProgressQuizItem {
    quiz_uuid: string;
    quiz_title: string;
    subject_name: string;
    difficulty: Difficulty;
    duration: number;
    total_questions: number;
    start_time: string;            // ISO string
    attempt_id: number;
}

/** Subject mastery untuk dashboard */
export interface ISubjectMasteryItem {
    subject_name: string;
    mastery_percentage: number;    // 0-100
    completed: number;
    total: number;
    average_score: number;
}

/** Weekly score data untuk bar chart */
export interface IWeeklyScoreItem {
    day: string;                   // "Sen", "Sel", etc.
    average_score: number;
    quizzes_done: number;
}

/** Activity log item */
export interface IStudentActivityItem {
    id: string;
    action: "COMPLETED_QUIZ" | "STARTED_QUIZ" | "REVIEWED_QUIZ";
    quiz_title: string;
    subject_name: string;
    score?: number;
    created_at: string;            // ISO string
}

// ─────────────────────────────────────────────────────────────────────────────
// QUIZ ATTEMPT — CLIENT STATE
// ─────────────────────────────────────────────────────────────────────────────

/** Option yang di-enrich dengan data untuk quiz page */
export interface IQuizOption {
    idOption: number;
    uuid: string;
    option_text: string;
    option_image: string;
}

/** Question yang di-enrich untuk quiz page (tanpa is_correct!) */
export interface IQuizQuestion {
    idQuestion: number;
    uuid: string;
    question_text: string;
    question_image: string;
    difficulty: Difficulty;
    poin: number;
    options: IQuizOption[];
}

/** Full quiz detail untuk halaman pengerjaan quiz */
export interface IQuizDetail {
    uuid: string;
    quiz_title: string;
    difficulty: Difficulty;
    duration: number;              // minutes
    total_questions: number;
    subject_name: string;
    questions: IQuizQuestion[];
    // Jika ada attempt yang belum selesai
    attempt?: {
        idAttempt: number;
        start_time: string;
        saved_answers: Record<number, number>; // questionId → optionId
    } | null;
}

/** Status per soal di question navigator */
export type QuestionNavStatus =
    | "NOT_ANSWERED"
    | "ANSWERED"
    | "MARKED_REVIEW"
    | "CURRENT";

/** Client-side quiz attempt state */
export interface IQuizAttemptState {
    quiz_uuid: string;
    attempt_id: number | null;
    start_time: Date;
    answers: Record<number, number>;          // questionId → optionId
    marked_for_review: Set<number>;           // questionId
    current_question_index: number;
    is_submitted: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUIZ RESULT
// ─────────────────────────────────────────────────────────────────────────────

/** Response dari GET /student/result/:uuid */
export interface IQuizResult {
    quiz_uuid: string;
    quiz_title: string;
    subject_name: string;
    difficulty: Difficulty;
    score: {
        uuid: string;
        total_questions: number;
        correct: number;
        wrong: number;
        skipped: number;
        score: number;             // 0-100
        accuracy: number;          // percentage
        start_time: string;
        finished_time: string;
        duration_used: number;     // menit
    };
    rank: number | null;
    xp_earned: number;
    question_breakdown: IResultQuestionItem[];
}

/** Per-question summary di result page */
export interface IResultQuestionItem {
    question_index: number;
    question_text: string;
    selected_option_id: number | null;
    is_correct: boolean;
    is_skipped: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUIZ REVIEW
// ─────────────────────────────────────────────────────────────────────────────

/** Option di review page (dengan is_correct) */
export interface IReviewOption {
    idOption: number;
    uuid: string;
    option_text: string;
    option_image: string;
    is_correct: boolean;
}

/** Per-question review */
export interface IReviewQuestion {
    idQuestion: number;
    uuid: string;
    question_index: number;
    question_text: string;
    question_image: string;
    difficulty: Difficulty;
    poin: number;
    options: IReviewOption[];
    selected_option_id: number | null;
    correct_option_id: number;
    is_correct: boolean;
    is_skipped: boolean;
    is_marked_review: boolean;
}

/** Response dari GET /student/review/:uuid */
export interface IQuizReview {
    quiz_uuid: string;
    quiz_title: string;
    subject_name: string;
    difficulty: Difficulty;
    total_questions: number;
    correct_count: number;
    wrong_count: number;
    skipped_count: number;
    score: number;
    questions: IReviewQuestion[];
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS
// ─────────────────────────────────────────────────────────────────────────────

/** Per-subject progress detail */
export interface ISubjectProgressDetail {
    subject_name: string;
    total_quiz: number;
    completed_quiz: number;
    average_score: number;
    mastery_percentage: number;
    trend: "UP" | "DOWN" | "STABLE";
}

/** Monthly performance data */
export interface IMonthlyPerformance {
    month: string;                 // "Jan", "Feb", etc.
    average_score: number;
    quizzes_done: number;
}

/** Accuracy trend (weekly) */
export interface IAccuracyTrend {
    week: string;                  // "W1", "W2", etc.
    accuracy: number;              // percentage
}

/** Weak/strong topic item */
export interface ITopicAnalysis {
    topic: string;
    subject: string;
    accuracy: number;
    attempts: number;
}

/** Response dari GET /student/progress */
export interface IStudentProgress {
    overall: {
        average_score: number;
        learning_streak: number;
        completed_quiz: number;
        total_quiz: number;
        completion_rate: number;
        average_accuracy: number;
        total_time_spent: number;  // menit
    };
    subject_progress: ISubjectProgressDetail[];
    monthly_performance: IMonthlyPerformance[];
    accuracy_trend: IAccuracyTrend[];
    weak_topics: ITopicAnalysis[];
    strong_topics: ITopicAnalysis[];
    recent_activity: IStudentActivityItem[];
}