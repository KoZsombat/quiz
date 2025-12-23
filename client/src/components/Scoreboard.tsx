interface Users {
    roomId: string;
    userId: string;
    username: string;
    score: number;
}

export default function Alert({ userList }: { userList: Users[] }) {

    const Users = userList;

    return (
        <div className="flex justify-center items-start w-full pt-4 z-50 px-4">
            <div
                className="bg-blue-600 border border-blue-700 text-white px-6 py-4 rounded-xl shadow-lg max-w-md w-full space-y-2"
                role="alert"
            >
                <p className="font-bold text-lg text-center mb-2">🏆 Scoreboard</p>
                <div className="divide-y divide-blue-500">
                {Users.sort((a, b) => b.score - a.score).map((p, index) => (
                    <div key={p.username} className="flex justify-between py-1 px-2">
                    <span className="font-medium">{index + 1}. {p.username}</span>
                    <span className="font-bold">{p.score}</span>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}