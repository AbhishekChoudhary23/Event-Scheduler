function useEventHandlers(events, setSelectedDayEvents, setOpen, setModalTitle) {
  const handleOpen = (date) => {
    const dayEvents = events.filter(
      (event) => event.start.toDateString() === date.toDateString()
    );
    setSelectedDayEvents(dayEvents);
    setOpen(true);
    setModalTitle(`Events for ${date.toLocaleDateString()}`);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return { handleOpen, handleClose };
}

export default useEventHandlers;