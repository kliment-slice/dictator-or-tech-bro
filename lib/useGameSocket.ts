"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ClientMessage, ServerMessage, PublicGameState } from "./wsMessages";
import type { Category } from "./types";

export function useGameSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [gameState, setGameState] = useState<PublicGameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [wasReset, setWasReset] = useState(false);

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  useEffect(() => {
    let unmounted = false;

    function connect() {
      if (unmounted) return;
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (unmounted) return;
        setConnected(true);
        // Attempt to rejoin with stored credentials
        const storedId = localStorage.getItem("dotb_player_id");
        const storedName = localStorage.getItem("dotb_player_name");
        if (storedId && storedName) {
          ws.send(JSON.stringify({ type: "join", playerId: storedId, name: storedName }));
        }
      };

      ws.onmessage = (event) => {
        if (unmounted) return;
        const msg: ServerMessage = JSON.parse(event.data);
        if (msg.type === "state_sync") {
          setGameState(msg.state);
        } else if (msg.type === "init") {
          setPlayerId(msg.playerId);
          localStorage.setItem("dotb_player_id", msg.playerId);
          setWasReset(false);
        } else if (msg.type === "reset") {
          localStorage.removeItem("dotb_player_id");
          localStorage.removeItem("dotb_player_name");
          setPlayerId(null);
          setWasReset(true);
        }
      };

      ws.onclose = () => {
        if (unmounted) return;
        setConnected(false);
        reconnectRef.current = setTimeout(connect, 2000);
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      unmounted = true;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, []);

  const joinGame = useCallback(
    (name: string) => {
      localStorage.setItem("dotb_player_name", name);
      const storedId = localStorage.getItem("dotb_player_id");
      send({ type: "join", name, playerId: storedId ?? undefined });
    },
    [send]
  );

  const submitAnswer = useCallback(
    (questionId: number, category: Category) => {
      send({ type: "answer", questionId, category });
    },
    [send]
  );

  const hostAction = useCallback(
    (action: "start" | "reveal" | "next" | "reset" | "restart") => {
      send({ type: "host_action", action });
    },
    [send]
  );

  return {
    gameState,
    playerId,
    connected,
    wasReset,
    joinGame,
    submitAnswer,
    hostAction,
  };
}
