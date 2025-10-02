interface Users {
    roomId: string;
    userId: string;
    username: string;
    score: number;
}

export default function Alert({ userList }: { userList: Users[] }) {

    const Users = userList;

    return (
        <div className="flex justify-center items-center w-[100vw]">
            <div className="fixed top-2 right-0 left-0 bg-blue-100 border border-blue-400 text-white px-4 py-3 rounded relative z-50 max-w-[80vw]" role="alert">
                <p className="font-bold" >Scoreboard:</p>
                {Users.sort((a, b) => b.score - a.score).map(p => {
                    return (
                        <p key={p.username}>{p.username}: {p.score}</p>
                    )
                })}
            </div>
        </div>
    );
}