import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/event");
      setEvents(res.data?.data || []);
    } catch (err) {
      setEvents([]);
      setError(
        err.response?.data?.message || "Impossible de charger les événements.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { events, loading, error, refresh };
}
