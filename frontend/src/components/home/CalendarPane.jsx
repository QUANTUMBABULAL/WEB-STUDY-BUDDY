import React, { useCallback, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
// import '@fullcalendar/common/main.css';
// import '@fullcalendar/daygrid/main.css';

import { listEvents, createEvent, updateEvent, deleteEvent } from '../../api/calendarApi';
import socket from '../../socket';
import { logError } from '../../utils/logger';

const initialForm = { title: '', className: 'DSA', color: '#2b9cf3' };

export default function CalendarPane() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, mode: 'add', date: '', id: null });
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  const renderEventContent = useCallback((eventInfo) => {
    return <div className="calendar-event-title">{eventInfo.event.title}</div>;
  }, []);

  const fetchEvents = useCallback(async () => {
    const data = await listEvents();
    return (data || []).map(normalizeEvent);
  }, []);

  const refreshFromServer = useCallback(async () => {
    try {
      const mapped = await fetchEvents();
      setEvents(mapped);
      setError('');
    } catch (err) {
      logError('refresh events failed', err);
      setError(err.error || err.response?.data?.error || err.response?.data?.message || 'Unable to load events');
    }
  }, [fetchEvents]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    fetchEvents()
      .then((mapped) => {
        if (ignore) return;
        setEvents(mapped);
        setError('');
      })
      .catch((err) => {
        if (ignore) return;
        logError('initial load events failed', err);
        setError(err.error || err.response?.data?.error || err.response?.data?.message || 'Unable to load events');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [fetchEvents]);

  useEffect(() => {
    const handleCalendarUpdate = (freshEvents = []) => {
      setEvents(freshEvents.map(normalizeEvent));
    };

    socket.on('calendar:update', handleCalendarUpdate);
    return () => {
      socket.off('calendar:update', handleCalendarUpdate);
    };
  }, []);

  const openAdd = (dateStr) => {
    setForm(initialForm);
    setModal({ open: true, mode: 'add', date: dateStr, id: null });
  };

  const openEdit = (info) => {
    const event = info.event;
    setForm({
      title: event.title,
      className: event.extendedProps.className || 'Data Structures',
      color: event.backgroundColor || '#2b9cf3'
    });
    setModal({
      open: true,
      mode: 'edit',
      date: event.startStr || event.start?.toISOString().slice(0, 10),
      id: event.id
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      const payload = buildPayload(form, modal.date);
      await createEvent(payload);
      await refreshFromServer();
      closeModal();
    } catch (err) {
      logError('create event failed', err);
      alert(err.response?.data?.message || 'Unable to save event');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !modal.id) return;
    try {
      const payload = buildPayload(form, modal.date);
      await updateEvent(modal.id, payload);
      await refreshFromServer();
      closeModal();
    } catch (err) {
      logError('update event failed', err);
      alert(err.response?.data?.message || 'Unable to update event');
    }
  };

  const handleDelete = async () => {
    if (!modal.id) return;
    if (!window.confirm('Delete this event?')) return;
    try {
      await deleteEvent(modal.id);
      await refreshFromServer();
      closeModal();
    } catch (err) {
      logError('delete event failed', err);
      alert(err.response?.data?.message || 'Unable to delete event');
    }
  };

  const closeModal = () => {
    setModal({ open: false, mode: 'add', date: '', id: null });
    setForm(initialForm);
  };

  return (
    <div className="calendar-wrap">
      <h2>Calendar</h2>
      <div className="calendar-panel panel">
        {loading ? (
          <p>Loading events...</p>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: '', center: 'title', right: 'today prev,next' }}
            height="auto"
            contentHeight={620}
            dayMaxEventRows={3}
            displayEventTime={false}
            events={events}
            eventDisplay="block"
              eventContent={renderEventContent}
            dateClick={(info) => openAdd(info.dateStr)}
            eventClick={openEdit}
          />
        )}
        {error && (
          <p className="error" style={{ marginTop: 12 }}>
            {error}
          </p>
        )}
      </div>

      {modal.open && (
        <div className="cg-modal-backdrop" onClick={closeModal}>
          <form className="cg-modal" onClick={(e) => e.stopPropagation()} onSubmit={modal.mode === 'add' ? handleAdd : handleSave}>
            <h3>{modal.mode === 'add' ? 'Add Topic / Syllabus' : 'Edit Event'}</h3>
            <label>Date</label>
            <input value={modal.date} readOnly />
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
            <label>Class</label>
            <select value={form.className} onChange={(e) => setForm((prev) => ({ ...prev, className: e.target.value }))}>
              <option>DSA</option>
              <option>MATHS</option>
              <option>DDCO</option>
              <option>AFLL</option>
              <option>WT</option>
              <option>CIE</option>
            </select>
            <label>Color</label>
            <input type="color" value={form.color} onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))} />
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              {modal.mode === 'edit' && (
                <button type="button" className="btn btn-secondary" onClick={handleDelete}>
                  Delete
                </button>
              )}
              <button type="submit" className="btn btn-primary">
                {modal.mode === 'add' ? 'Add' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function buildPayload(form, date) {
  return {
    title: form.title.trim(),
    start: date,
    className: form.className,
    backgroundColor: form.color,
    borderColor: form.color,
    textColor: '#000000ff'
  };
}

function normalizeEvent(event) {
  return {
    id: event._id || event.id,
    title: event.title,
    start: event.start,
    backgroundColor: event.backgroundColor || '#2b9cf3',
    borderColor: event.borderColor || event.backgroundColor || '#2b9cf3',
    textColor: event.textColor || '#000000ff',
    extendedProps: { className: event.className || '' }
  };
}
