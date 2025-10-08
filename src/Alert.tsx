export default function Alert({ error }: { error: string }) {

    const msg = error || "An unexpected error occurred. Please try again later.";

    return (
        <div className="flex justify-center items-start w-full fixed top-4 z-50 px-4">
            <div
                className="bg-blue-100 border border-blue-400 text-blue-800 px-6 py-4 rounded-lg shadow-md max-w-lg w-full animate-slideDown"
                role="alert"
            >
                <p className="font-bold text-blue-700 mb-1">Notice</p>
                <p className="text-blue-800">{msg}</p>
            </div>
        </div>
    );
}