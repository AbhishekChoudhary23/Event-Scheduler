import React, { useEffect, useState } from "react";
import { Calendar } from "rsuite";
import renderCell from "../Components/Calendar/RenderCell";
import ShowEventModal from "../Components/Calendar/ShowEventModal";
import io from "socket.io-client";
import "rsuite/dist/rsuite.min.css";
import "../styles/CalenderPage.css";
import useEventHandlers from "../utils/CalenderUtils";

const socket = io.connect("http://localhost:3005");

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const { handleOpen, handleClose } = useEventHandlers(events, setSelectedDayEvents, setOpen, setModalTitle);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/event", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        const parsedEvents = data.map((event) => ({
          ...event,
          start: new Date(event.startDateTime),
          end: new Date(event.endDateTime),
        }));
        setEvents(parsedEvents);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchEvents();

    const handleNewEvent = (eventData) => {
      const newEvent = {
        ...eventData,
        start: new Date(eventData.startDateTime),
        end: new Date(eventData.endDateTime),
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    };

    socket.on("new_event", handleNewEvent);

    return () => {
      socket.off("new_event", handleNewEvent);
    };
  }, []);

  return (
    <div className="calendar-container">
      <Calendar
        className="inside-calendar"
        bordered
        renderCell={(date) => renderCell(events, date)}
        onSelect={handleOpen}
      />
      <ShowEventModal
        open={open}
        onClose={handleClose}
        modalTitle={modalTitle}
        selectedDayEvents={selectedDayEvents}
      />
    </div>
  );
}

export default CalendarPage;