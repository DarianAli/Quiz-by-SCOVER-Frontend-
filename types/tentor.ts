export interface TentorSubjectSummary {
    id: number;
    uuid: string;
    subject_name: string;
    student_count: number;
    total_quiz: number;
    published_quiz: number;
    draft_quiz: number;
    total_question: number;
    average_score: number;
    annual_quiz_target: number;
    completed_quizzes: number;
    curriculum_progress: number;
}