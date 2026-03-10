import React from 'react';
import TicketManager from './TicketManager';

export default function Escalated() {
  return <TicketManager defaultFilter="escalated" title="Escalated Tickets" />;
}
