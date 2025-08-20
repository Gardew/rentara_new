
import io from "socket.io-client";
import {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {addMessage} from "../slices/messageSlice.js";

const SOCKET_URL = import.meta.env.VITE_API_URL || "";
const FRONTEND_URL = import.meta.env.VITE_PUBLIC_URL || (typeof window !== 'undefined' ? window.location.origin : "");

export function useSocket(token) {
    const [socket, setSocket] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        // Do not attempt to connect without required info
        if (!token) return;
        if (!SOCKET_URL || !FRONTEND_URL) return;

        const isLocalApi = SOCKET_URL.includes("localhost");
        const isLocalFront = FRONTEND_URL.includes("localhost");
        // If running on localhost frontend but API points to production, don't connect
        if (!isLocalApi && isLocalFront) return;

        const newSocket = io(SOCKET_URL, {
            auth: { token },
        });
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Connected to socket");
        });

        newSocket.on('receive_message', (newMessage) => {
            if (newMessage.senderId === newMessage.receiverId) {
                return;
            }
            dispatch(addMessage(newMessage));
        });

        return () => newSocket.disconnect();

    }, [token]);

    return socket;
}