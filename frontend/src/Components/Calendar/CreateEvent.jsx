// EventCreationModal.js
import React from 'react';
import { Modal, Form, Button, DateRangePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

function EventCreationModal({ open, onClose, formValue, setFormValue, datetime, setDatetime, onSubmit }) {
  return (
    <Modal open={open} onClose={onClose} size="xs">
      <Modal.Header>
        <Modal.Title>New Event</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form fluid onChange={setFormValue} formValue={formValue}>
          <Form.Group controlId="title">
            <Form.ControlLabel>Title</Form.ControlLabel>
            <Form.Control name="title" required />
            <Form.HelpText>Required</Form.HelpText>
          </Form.Group>
          <Form.Group controlId="description">
            <Form.ControlLabel>Description</Form.ControlLabel>
            <Form.Control name="description" />
          </Form.Group>
          <Form.Group controlId="participants">
            <Form.ControlLabel>Participants</Form.ControlLabel>
            <Form.Control name="participants" />
          </Form.Group>
          <Form.Group controlId="datetime">
            <Form.ControlLabel>Date and Time</Form.ControlLabel>
            <DateRangePicker
              format="dd/MM/yyyy HH:mm"
              value={datetime}
              onChange={(value) => setDatetime(value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onSubmit} color="violet" appearance="primary">
          Confirm
        </Button>
        <Button onClick={onClose} color="violet" appearance="ghost">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EventCreationModal;