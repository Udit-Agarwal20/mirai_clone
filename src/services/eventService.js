const Event = require('../models/Event');

class EventService {
  /**
   * Get the nearest active upcoming event for countdown and priority banners
   */
  static async getNearestUpcomingEvent() {
    const now = new Date();

    // First find events ending in the future
    let event = await Event.findOne({
      isActive: true,
      endDate: { $gte: now },
    }).sort({ endDate: 1 });

    // Fallback: If no future event, find the most recently concluded active event
    if (!event) {
      event = await Event.findOne({ isActive: true }).sort({ endDate: -1 });
    }

    if (!event) return null;

    const diffMs = new Date(event.endDate).getTime() - now.getTime();
    const isPast = diffMs <= 0;
    const isToday = !isPast && diffMs <= 24 * 60 * 60 * 1000;

    let status = 'UPCOMING';
    if (isPast) {
      status = 'CLOSED';
    } else if (isToday) {
      status = 'TODAY';
    }

    // Time calculations
    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      event,
      status,
      isPast,
      isToday,
      remaining: {
        totalSeconds,
        days,
        hours,
        minutes,
        seconds,
      },
      isoEndDate: event.endDate.toISOString(),
      formattedDeadline: new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      }).format(new Date(event.endDate)),
    };
  }

  /**
   * Get all active admission events categorized
   */
  static async getAllActiveEvents() {
    const events = await Event.find({ isActive: true }).sort({ startDate: 1 });
    const now = new Date();

    return events.map((event) => {
      const diffMs = new Date(event.endDate).getTime() - now.getTime();
      const isPast = diffMs <= 0;
      const isToday = !isPast && diffMs <= 24 * 60 * 60 * 1000;

      let status = 'UPCOMING';
      if (isPast) status = 'CLOSED';
      else if (isToday) status = 'TODAY';

      return {
        event,
        status,
        isPast,
        isToday,
      };
    });
  }
}

module.exports = EventService;
