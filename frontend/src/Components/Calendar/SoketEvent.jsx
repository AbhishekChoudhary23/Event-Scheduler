// SocketEvents.js
import { useEffect } from 'react';
import { useToaster, Message } from 'rsuite';
import io from 'socket.io-client';

const socket = io.connect("http://localhost:3005");

function useSocketEvents(email) {
  const toaster = useToaster();

  useEffect(() => {
    socket.emit("login", email);

    socket.on("event_invitation", (eventData) => {
      toaster.push(
        <Message showIcon type="info" closable>
          You have a new event invitation!
          <br />
          <strong>Title:</strong> {eventData.title}
          <br />
          <strong>Description:</strong> {eventData.description}
          <br />
          <strong>Start:</strong> {new Date(eventData.startDateTime).toLocaleString()}
          <br />
          <strong>End:</strong> {new Date(eventData.endDateTime).toLocaleString()}
          <br />
          <strong>Created By:</strong> {eventData.createdBy}
        </Message>,
        { placement: "topEnd", duration: 4000 }
      );
    });

    return () => {
      socket.off("event_invitation");
    };
  }, [email, toaster]);
}

export default useSocketEvents;