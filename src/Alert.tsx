export default function Alert({ error }: { error: string }) {

    const msg = error || "An unexpected error occurred. Please try again later.";

    return (
        <div className="flex justify-center items-center w-[100vw]">
            <div className="fixed top-2 right-0 left-0 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative z-50 max-w-[80vw]" role="alert">
                <p className="font-bold" >Alert!</p>
                <p className="block sm:inline" >{msg}</p>
            </div>
        </div>
    );
}