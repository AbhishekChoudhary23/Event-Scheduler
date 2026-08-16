import React from 'react';
import { Modal, Button, Text } from 'rsuite';
import '../../styles/ShowEventModal.css'

function ShowEventModal({ open, onClose, modalTitle, selectedDayEvents }) {
  return (
    <div className="modal">
    <Modal open={open} onClose={onClose} onClick={() => handleOpen(400)}>
      <Modal.Header>
        <Modal.Title>{modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{background:"#c7c3c7"}}>
        {selectedDayEvents.length ? (
          selectedDayEvents.map((event, index) => (
            <div key={index} className="events">
              <Text weight="extrabold" size={30} color='violet'>
                {event.title}
              </Text>
              <p>
                <strong>Description:</strong> {event.description}
              </p>
              <p>
                <strong>Start:</strong>{" "}
                {new Date(event.startDateTime).toLocaleString()}
              </p>
              <p>
                <strong>End:</strong>{" "}
                {new Date(event.endDateTime).toLocaleString()}
              </p>
              <p>
                <strong>Created By:</strong>{" "}
                {event?.createdBy?.firstname} ({event?.createdBy?.email})
              </p>
            </div>
          ))
        ) : (
          <p>No events scheduled for this day.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} appearance="primary" color='violet'>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
    </div>
  );
}

export default ShowEventModal;