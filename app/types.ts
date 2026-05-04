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