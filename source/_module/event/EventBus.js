// source/_module/event/EventBus.js
const EventBus = (function() {
  const listeners = {};

  function subscribe(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
    // return unsubscribe function
    return () => unsubscribe(event, callback);
  }

  function unsubscribe(event, callback) {
    if (!listeners[event]) return;
    const index = listeners[event].indexOf(callback);
    if (index !== -1) listeners[event].splice(index, 1);
  }

  function publish(event, data) {
    if (!listeners[event]) return;
    listeners[event].forEach(cb => {
      try { cb(data); } catch(e) { console.error(e); }
    });
  }

  function clear(event) {
    if (event) delete listeners[event];
    else Object.keys(listeners).forEach(k => delete listeners[k]);
  }

  return {
    on: subscribe,
    off: unsubscribe,
    emit: publish,
    clear: clear
  };
})();