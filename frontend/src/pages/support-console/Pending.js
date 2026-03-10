import React from 'react';
import TicketManager from './TicketManager';

export default function Pending() {
  return <TicketManager defaultFilter="pending" title="Pending Tickets" />;
}
