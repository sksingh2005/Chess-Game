import { useEffect, useState } from "react";

const url = "ws://localhost:8080";

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      setSocket(null); 
    };
    return () => {
      ws.close();
    };
  }, []); 

  return socket;
};
