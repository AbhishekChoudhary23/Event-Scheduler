import { useEffect } from 'react';
import { useToaster, Message } from 'rsuite';
import io from 'socket.io-client';

const socket = io.connect(import.meta.env.VITE_SOCKET_URL);

function useSocketEvents(email) {
  const toaster = useToaster();

  useEffect(() => {
    socket.emit("login", email);

    socket.on("event_invitation", (eventData) => {
      const startDateTime = eventData.startDateTime.replace('T', ' ').replace('Z', '');
      const endDateTime = eventData.endDateTime.replace('T', ' ').replace('Z', '');
    
      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);
    
      toaster.push(
        <Message showIcon type="info" closable>
          You have a new event invitation!
          <br />
          <strong>Title:</strong> {eventData.title}
          <br />
          <strong>Description:</strong> {eventData.description}
          <br />
          <strong>Start:</strong> {startDate.toLocaleString()}
          <br />
          <strong>End:</strong> {endDate.toLocaleString()}
          <br />
          <strong>Created By:</strong> {eventData?.createdBy?.firstname} ({eventData?.createdBy?.email})
        </Message>,
        { placement: "bottomEnd", duration: 4000 }
      );
    });
    
    return () => {
      socket.off("event_invitation");
    };

  }, [email, toaster]);
}

export default useSocketEvents;