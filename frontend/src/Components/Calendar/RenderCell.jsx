import React from "react";
import { Whisper, Popover, Badge } from "rsuite";
import '../../styles/RenderCell.css'

function renderCell(events, date) {
  const list = events.filter((event) => {
    const eventStartDate = event.start.toDateString();
    const eventEndDate = event.end.toDateString();
    const selectedDate = date.toDateString();
    return selectedDate >= eventStartDate && selectedDate <= eventEndDate;
  });
  const displayList = list.slice(0, 1);
  const moreCount = list.length - displayList.length;
  if (list.length) {
    const moreItem = (
      <div>
        <Whisper
          placement="top"
          trigger="hover"
          speaker={
            <Popover className="popover">
              {list.slice(1).map((item, index) => (
                <p key={index}>
                  <b>
                    {item.start.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </b>{" "}
                  - <span>{item.title || "Untitled Event"}</span>
                </p>
              ))}
            </Popover>
          }
        >
          <p style={{textDecoration:"underline", color:"#501455"}}>{moreCount} more</p>
        </Whisper>
      </div>
    );
    return (
      <ul className="calendar-todo-list">
        {displayList.map((item, index) => (
          <div key={index}>
            <Badge color="violet" />{" "}
            <b>
              {item.start.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </b>{" "}
            - <span>{item.title}</span>
          </div>
        ))}
        {moreCount ? moreItem : null}
      </ul>
    );
  }
  return null;
}

export default renderCell;