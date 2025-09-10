import { useEffect } from "react";
import socket from "../socket-client";

/**
 * Subscribe to reservation events.
 * @param {object} options { restaurantId, onCreated, onUpdated, onCancelled, onStatusChanged }
 */
export function useReservationsSocket({
  restaurantId,
  onCreated,
  onUpdated,
  onCancelled,
  onStatusChanged,
}) {
  useEffect(() => {
    if (!restaurantId) return;

    // Join restaurant room
    socket.emit("joinRestaurantRoom", restaurantId);

    if (onCreated) socket.on("reservationCreated", onCreated);
    if (onUpdated) socket.on("reservationUpdated", onUpdated);
    if (onCancelled) socket.on("reservationCancelled", onCancelled);
    if (onStatusChanged) socket.on("reservationStatusChanged", onStatusChanged);

    return () => {
      // Leave room & cleanup listeners
      socket.emit("leaveRestaurantRoom", restaurantId);
      socket.off("reservationCreated", onCreated);
      socket.off("reservationUpdated", onUpdated);
      socket.off("reservationCancelled", onCancelled);
      socket.off("reservationStatusChanged", onStatusChanged);
    };
  }, [restaurantId]);
}
