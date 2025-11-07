import { useState } from "react";

function useCheckLogin() {
    const [username] = useState<string | null>(localStorage.getItem("user") || null);
    const [logged] = useState(username ? true : false);

    return { logged, username };
}

export default useCheckLogin;
