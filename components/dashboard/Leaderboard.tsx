import { Trophy, Medal, Star } from "lucide-react";
import ProfilePicTest from "@/public/images/profile.jpeg";

type StudentRank = {
    id: string;
    name: string;
    points: number;
    rank: number;
    isCurrentUser?: boolean;
    avatar?: string;
};

// Dummy Data
const MOCK_LEADERBOARD: StudentRank[] = [
    { id: "1", name: "Misca Andromeda", points: 12540, rank: 1, avatar: ProfilePicTest.src },
    { id: "2", name: "Budi Santoso", points: 11200, rank: 2, avatar: ProfilePicTest.src },
    { id: "3", name: "Clara Wijaya", points: 10850, rank: 3, avatar: ProfilePicTest.src },
    { id: "4", name: "David K", points: 9500, rank: 4 },
    { id: "5", name: "Eko Pratama", points: 9200, rank: 5 },
    { id: "6", name: "Fanya R (You)", points: 8900, rank: 6, isCurrentUser: true },
    { id: "7", name: "Gina M", points: 8500, rank: 7 },
    { id: "8", name: "Hardi P", points: 8100, rank: 8 },
];

const RankingCard = ({ student }: { student: StudentRank }) => {
    // Styling differs slightly based on Rank 1, 2, 3
    const isFirst = student.rank === 1;
    
    let ringColor = "ring-gray-200";
    let icon = <Star className="w-5 h-5 text-gray-500 fill-gray-500" />;
    
    if (student.rank === 1) {
        ringColor = "ring-[#F9C73D]";
        icon = <Trophy className="w-6 h-6 text-[#F9C73D] fill-[#F9C73D]" />;
    } else if (student.rank === 2) {
        ringColor = "ring-gray-300";
        icon = <Medal className="w-5 h-5 text-gray-400 fill-gray-400" />;
    } else if (student.rank === 3) {
        ringColor = "ring-amber-600/60";
        icon = <Medal className="w-5 h-5 text-amber-700 fill-amber-700" />;
    }

    return (
        <div className={`flex flex-col items-center p-4 rounded-2xl bg-white border border-[#EAEAEA] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${isFirst ? 'scale-105 z-10 mx-2 border-[#F9C73D]/50' : 'scale-95 opacity-90 hover:opacity-100 hover:scale-100'}`}>
            <div className="relative mb-3">
                <img 
                    src={student.avatar || ProfilePicTest.src}
                    alt={student.name}
                    className={`rounded-full object-cover ring-4 shadow-sm ${ringColor} ${isFirst ? 'w-20 h-20' : 'w-16 h-16'}`}
                />
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                    {icon}
                </div>
            </div>
            
            <h4 className={`font-bold text-center text-[#083E63] line-clamp-1 ${isFirst ? 'text-lg mt-1' : 'text-sm'}`}>
                {student.name}
            </h4>
            <div className="mt-1 flex items-center justify-center gap-1.5 bg-[#F8FAFC] px-3 py-1 rounded-full border border-gray-100">
                <span className="text-[#F9C73D]">✨</span>
                <span className="font-bold text-sm text-[#0B5C8C]">{student.points.toLocaleString()}</span>
            </div>
        </div>
    );
};

const LeaderboardList = ({ students }: { students: StudentRank[] }) => {
    return (
        <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-sm overflow-hidden flex flex-col h-[320px]">
            <div className="px-5 py-4 border-b border-[#EAEAEA] bg-gray-50/50">
                <h4 className="font-bold text-[#083E63]">Global Ranking</h4>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                <div className="flex flex-col gap-1.5">
                    {students.map((std) => (
                        <div 
                            key={std.id}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${std.isCurrentUser ? 'bg-[#F9C73D]/10 border border-[#F9C73D]/30 border-l-4 border-l-[#F9C73D]' : 'hover:bg-[#F8FAFC] border border-transparent'}`}
                        >
                            <div className="w-6 font-bold text-gray-400 text-sm text-center">
                                #{std.rank}
                            </div>
                            
                            <img src={std.avatar || ProfilePicTest.src} alt={std.name} className="w-8 h-8 rounded-full border border-gray-100" />
                            
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold truncate ${std.isCurrentUser ? 'text-[#083E63]' : 'text-gray-700'}`}>
                                    {std.name}
                                </p>
                            </div>
                            
                            <div className="font-bold text-sm text-[#0B5C8C]">
                                {std.points.toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const LeaderboardSection = () => {
    const topThree = [MOCK_LEADERBOARD[1], MOCK_LEADERBOARD[0], MOCK_LEADERBOARD[2]]; // Ordered for visual layout: 2, 1, 3
    const restList = MOCK_LEADERBOARD.slice(3);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-end lg:items-start h-full">
            {/* Left: Top 3 */}
            <div className="flex flex-row justify-center items-end pb-4 pt-8 h-[320px]">
                <div className="flex-1 max-w-[140px] mb-4 relative z-0">
                    <RankingCard student={topThree[0]} />
                </div>
                <div className="flex-1 max-w-[160px] relative z-20">
                    <RankingCard student={topThree[1]} />
                </div>
                <div className="flex-1 max-w-[140px] mb-6 relative z-10">
                    <RankingCard student={topThree[2]} />
                </div>
            </div>
            
            {/* Right: Scrollable list */}
            <div className="w-full h-full">
                <LeaderboardList students={restList} />
            </div>
        </div>
    );
};
