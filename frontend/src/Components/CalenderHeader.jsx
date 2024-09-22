// CalendarHeader.js
import React, { useState } from 'react';
import { useToaster, Message } from 'rsuite';
import { useNavigate } from 'react-router-dom';
import useSocketEvents from './Calendar/SoketEvent';
import EventCreationModal from './Calendar/CreateEvent';
import { io } from 'socket.io-client';
import 'rsuite/dist/rsuite.min.css';
import '../styles/CalenderHeader.css';

const socket = io.connect("http://localhost:3005");

const CalendarHeader = () => {
  const [open, setOpen] = useState(false);
  const [formValue, setFormValue] = useState({
    title: '',
    description: '',
    participants: '',
  });
  const [datetime, setDatetime] = useState([new Date(), new Date()]);

  const navigate = useNavigate();
  const toaster = useToaster();
  const email = localStorage.getItem('email');
  useSocketEvents(email);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  const handleOpen = () => {
    setOpen(true);
    setFormValue({ title: '', description: '', participants: '' });
  };

  const handleClose = () => {
    setOpen(false);
    setFormValue({ title: '', description: '', participants: '' });
  };

  const handleSubmit = () => {
    const startDateTime = datetime[0].toISOString().replace('T', ' ').replace('Z', '');
    const endDateTime = datetime[1].toISOString().replace('T', ' ').replace('Z', '');
    const participants = formValue.participants.split(' ');

    const eventData = {
      title: formValue.title,
      description: formValue.description,
      startDateTime,
      endDateTime,
      participants,
      createdBy: email,
    };

    socket.emit('new_event', eventData);

    fetch('http://localhost:3000/event/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(eventData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        toaster.push(
          <Message showIcon type="success">
            Event created successfully!
          </Message>,
          { placement: 'topCenter', duration: 4000 }
        );
      })
      .catch((error) => console.error(error));
    setOpen(false);
  };

  return (
    <header className="calendar-header">
      <div className="calendar-header-left">
        <span className="calendar-header-title">Calendar</span>
      </div>
      <h2>Hello {email}</h2>
      <div className="calendar-header-right">
        <button className="calendar-header-button" onClick={handleOpen}>
          Create
        </button>
        <button className="calendar-header-button" onClick={handleLogout}>
          Logout
        </button>
        <EventCreationModal
          open={open}
          onClose={handleClose}
          formValue={formValue}
          setFormValue={setFormValue}
          datetime={datetime}
          setDatetime={setDatetime}
          onSubmit={handleSubmit}
        />
      </div>
    </header>
  );
};

export default CalendarHeader;