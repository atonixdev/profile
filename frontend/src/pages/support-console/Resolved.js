import React from 'react';
import TicketManager from './TicketManager';

export default function Resolved() {
  return <TicketManager defaultFilter="resolved" title="Resolved Tickets" />;
}
