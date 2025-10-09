import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  queries: [
    {
      queryId: 'Q1701234567890',
      queryType: 'Technical',
      queryStatusL1: 'Open',
      queryStatusL2: null,
      queryStatusTimeL2: null,
      querySubject: 'App is crashing on login',
      queryDescription: 'The app crashes every time I try to login with my credentials',
      queryRaisedTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      tenantName: 'John Doe',
      tenantId: 'T001',
    },
    {
      queryId: 'Q1701234567891',
      queryType: 'Billing',
      queryStatusL1: 'In Progress',
      queryStatusL2: null,
      queryStatusTimeL2: null,
      querySubject: 'Invoice not received',
      queryDescription: 'I have not received my invoice for this month',
      queryRaisedTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      tenantName: 'Jane Smith',
      tenantId: 'T002',
    },
    {
      queryId: 'Q1701234567892',
      queryType: 'Personal Details',
      queryStatusL1: 'Resolved',
      queryStatusL2: null,
      queryStatusTimeL2: null,
      querySubject: 'Update contact information',
      queryDescription: 'I need to update my phone number and email address in the system',
      queryRaisedTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      tenantName: 'Mike Johnson',
      tenantId: 'T003',
    },
  ],
  tickets: [
    {
      ticketId: 'Q1701234567890',
      tenantName: 'John Doe',
      tenantId: 'T001',
      queryType: 'Technical',
      priority: 'High',
      status: 'Open',
      level: 'L1',
      subject: 'App is crashing on login',
      description: 'The app crashes every time I try to login with my credentials. This has been happening for the past 2 days.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      responses: [],
      assignedTo: 'Support Agent 1',
    },
    {
      ticketId: 'Q1701234567891',
      tenantName: 'Jane Smith',
      tenantId: 'T002',
      queryType: 'Billing',
      priority: 'Medium',
      status: 'In Progress',
      level: 'L1',
      subject: 'Invoice not received',
      description: 'I have not received my monthly invoice. Please check and resend.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      responses: [
        {
          id: 'R1',
          respondedBy: 'Support Agent 1',
          message: 'We are checking with the billing department. You should receive the invoice within 24 hours.',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ],
      assignedTo: 'Support Agent 1',
    },
    {
      ticketId: 'Q1701234567892',
      tenantName: 'Mike Johnson',
      tenantId: 'T003',
      queryType: 'Personal Details',
      priority: 'Low',
      status: 'Resolved',
      level: 'L1',
      subject: 'Update contact information',
      description: 'I need to update my phone number and email address in the system.',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      responses: [
        {
          id: 'R2',
          respondedBy: 'Support Agent 2',
          message: 'Your contact information has been updated successfully. Please verify the changes in your profile.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        }
      ],
      assignedTo: 'Support Agent 2',
      resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ],
  filters: {
    status: 'All',
    priority: 'All',
    level: 'All',
    assignedTo: 'All',
  },
};

const queriesSlice = createSlice({
  name: 'queries',
  initialState,
  reducers: {
    // Tenant Query Management
   addQuery: (state, action) => {
  // Ensure state structure exists
  if (!state) {
    state = { queries: [], tickets: [], filters: { status: 'All', priority: 'All', level: 'All', assignedTo: 'All' } };
  }
  if (!state.queries) state.queries = [];
  if (!state.tickets) state.tickets = [];

  const queryId = `Q${Date.now()}`;
  const newQuery = {
    queryId,
    queryType: action.payload.selectedProduct?.label || 'General',
    queryStatusL1: 'Open',
    queryStatusL2: null,
    queryStatusTimeL2: null,
    querySubject: action.payload.querySubject || '',
    queryDescription: action.payload.queryText2 || '',
    queryRaisedTime: new Date().toISOString(),
    tenantName: action.payload.tenantName || 'Unknown Tenant',
    tenantId: action.payload.tenantId || 'Unknown',
  };
  
  state.queries.unshift(newQuery);

  // Create ticket
  const newTicket = {
    ticketId: queryId,
    tenantName: newQuery.tenantName,
    tenantId: newQuery.tenantId,
    queryType: newQuery.queryType,
    priority: 'Medium',
    status: 'Open',
    level: 'L1',
    subject: newQuery.querySubject,
    description: newQuery.queryDescription,
    createdAt: newQuery.queryRaisedTime,
    updatedAt: newQuery.queryRaisedTime,
    responses: [],
    assignedTo: 'Unassigned',
  };
  
  state.tickets.unshift(newTicket);
},
    
    escalateToLevel2: (state, action) => {
      const { queryId } = action.payload;
      const query = state.queries.find(q => q.queryId === queryId);
      const ticket = state.tickets.find(t => t.ticketId === queryId);
      
      if (query) {
        query.queryStatusL2 = 'Open';
        query.queryStatusTimeL2 = new Date().toISOString();
      }
      
      if (ticket) {
        ticket.level = 'L2';
        ticket.status = 'Open';
        ticket.updatedAt = new Date().toISOString();
        
        // Add escalation response
        const escalationResponse = {
          id: `R${Date.now()}`,
          respondedBy: 'System',
          message: 'Ticket has been escalated to Level 2 support.',
          timestamp: new Date().toISOString(),
        };
        ticket.responses.push(escalationResponse);
      }
    },
    
    closeQuery: (state, action) => {
      const { queryId } = action.payload;
      const query = state.queries.find(q => q.queryId === queryId);
      const ticket = state.tickets.find(t => t.ticketId === queryId);
      
      if (query) {
        if (query.queryStatusL2) {
          query.queryStatusL2 = 'Closed';
        } else {
          query.queryStatusL1 = 'Closed';
        }
      }
      
      if (ticket) {
        ticket.status = 'Closed';
        ticket.updatedAt = new Date().toISOString();
        ticket.resolvedAt = new Date().toISOString();
      }
    },
    
    updateQueryStatus: (state, action) => {
      const { queryId, status, level } = action.payload;
      const query = state.queries.find(q => q.queryId === queryId);
      const ticket = state.tickets.find(t => t.ticketId === queryId);
      
      if (query) {
        if (level === 'L1') {
          query.queryStatusL1 = status;
        } else if (level === 'L2') {
          query.queryStatusL2 = status;
          if (!query.queryStatusTimeL2) {
            query.queryStatusTimeL2 = new Date().toISOString();
          }
        }
      }
      
      if (ticket) {
        ticket.status = status;
        ticket.updatedAt = new Date().toISOString();
        
        if (status === 'Resolved' || status === 'Closed') {
          ticket.resolvedAt = new Date().toISOString();
        }
      }
    },

    // Landlord Support Ticket Management
    addTicketResponse: (state, action) => {
      const { ticketId, message, respondedBy } = action.payload;
      const ticket = state.tickets.find(t => t.ticketId === ticketId);
      const query = state.queries.find(q => q.queryId === ticketId);
      
      if (ticket) {
        const newResponse = {
          id: `R${Date.now()}`,
          respondedBy,
          message,
          timestamp: new Date().toISOString(),
        };
        ticket.responses.push(newResponse);
        ticket.updatedAt = new Date().toISOString();
        
        // Update status to In Progress when response is added
        if (ticket.status === 'Open') {
          ticket.status = 'In Progress';
        }
        
        // Also update the corresponding query status
        if (query) {
          if (query.queryStatusL2) {
            query.queryStatusL2 = 'In Progress';
          } else {
            query.queryStatusL1 = 'In Progress';
          }
        }
      }
    },

    updateTicketStatus: (state, action) => {
      const { ticketId, status } = action.payload;
      const ticket = state.tickets.find(t => t.ticketId === ticketId);
      const query = state.queries.find(q => q.queryId === ticketId);
      
      if (ticket) {
        ticket.status = status;
        ticket.updatedAt = new Date().toISOString();
        
        if (status === 'Resolved' || status === 'Closed') {
          ticket.resolvedAt = new Date().toISOString();
        }
        
        // Sync with query status
        if (query) {
          if (query.queryStatusL2) {
            query.queryStatusL2 = status;
          } else {
            query.queryStatusL1 = status;
          }
        }
      }
    },

    updateTicketPriority: (state, action) => {
      const { ticketId, priority } = action.payload;
      const ticket = state.tickets.find(t => t.ticketId === ticketId);
      if (ticket) {
        ticket.priority = priority;
        ticket.updatedAt = new Date().toISOString();
      }
    },

    assignTicket: (state, action) => {
      const { ticketId, assignedTo } = action.payload;
      const ticket = state.tickets.find(t => t.ticketId === ticketId);
      if (ticket) {
        ticket.assignedTo = assignedTo;
        ticket.updatedAt = new Date().toISOString();
        
        // Update status to In Progress when assigned (if currently Open)
        if (ticket.status === 'Open') {
          ticket.status = 'In Progress';
        }
      }
    },

    escalateTicket: (state, action) => {
      const { ticketId } = action.payload;
      const ticket = state.tickets.find(t => t.ticketId === ticketId);
      const query = state.queries.find(q => q.queryId === ticketId);
      
      if (ticket) {
        ticket.level = 'L2';
        ticket.status = 'Open';
        ticket.updatedAt = new Date().toISOString();
        
        // Add escalation response
        const escalationResponse = {
          id: `R${Date.now()}`,
          respondedBy: 'System',
          message: 'Ticket has been escalated to Level 2 support.',
          timestamp: new Date().toISOString(),
        };
        ticket.responses.push(escalationResponse);
      }
      
      if (query) {
        query.queryStatusL2 = 'Open';
        query.queryStatusTimeL2 = new Date().toISOString();
      }
    },

    closeTicket: (state, action) => {
      const { ticketId, closureNote } = action.payload;
      const ticket = state.tickets.find(t => t.ticketId === ticketId);
      const query = state.queries.find(q => q.queryId === ticketId);
      
      if (ticket) {
        ticket.status = 'Closed';
        ticket.resolvedAt = new Date().toISOString();
        ticket.updatedAt = new Date().toISOString();
        
        if (closureNote) {
          const closureResponse = {
            id: `R${Date.now()}`,
            respondedBy: 'System',
            message: `Ticket closed: ${closureNote}`,
            timestamp: new Date().toISOString(),
          };
          ticket.responses.push(closureResponse);
        }
      }
      
      if (query) {
        if (query.queryStatusL2) {
          query.queryStatusL2 = 'Closed';
        } else {
          query.queryStatusL1 = 'Closed';
        }
      }
    },

    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const { 
  addQuery, 
  escalateToLevel2, 
  closeQuery, 
  updateQueryStatus,
  addTicketResponse,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
  escalateTicket,
  closeTicket,
  updateFilters,
} = queriesSlice.actions;

export const queriesSelectors = {
  // Query Selectors (for tenant view)
  getQueries: (state) => state.queries.queries,
  getQueryById: (state, queryId) => 
    state.queries.queries.find(q => q.queryId === queryId),
  getOpenQueries: (state) => 
    state.queries.queries.filter(q => 
      q.queryStatusL1 === 'Open' || q.queryStatusL2 === 'Open'
    ),
  getClosedQueries: (state) => 
    state.queries.queries.filter(q => 
      (q.queryStatusL2 && q.queryStatusL2 === 'Closed') || 
      (!q.queryStatusL2 && q.queryStatusL1 === 'Closed')
    ),
};

export const landlordSupportSelectors = {
  // Ticket Selectors (for landlord view)
  getAllTickets: (state) => state.queries.tickets,
  getTicketById: (state, ticketId) => 
    state.queries.tickets.find(t => t.ticketId === ticketId),
  getFilteredTickets: (state) => {
    const { tickets, filters } = state.queries;
    return tickets.filter(ticket => {
      if (filters.status !== 'All' && ticket.status !== filters.status) return false;
      if (filters.priority !== 'All' && ticket.priority !== filters.priority) return false;
      if (filters.level !== 'All' && ticket.level !== filters.level) return false;
      if (filters.assignedTo !== 'All' && ticket.assignedTo !== filters.assignedTo) return false;
      return true;
    });
  },
  getTicketStats: (state) => {
    const tickets = state.queries.tickets;
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'Open').length,
      inProgress: tickets.filter(t => t.status === 'In Progress').length,
      resolved: tickets.filter(t => t.status === 'Resolved').length,
      closed: tickets.filter(t => t.status === 'Closed').length,
    };
  },
  getFilters: (state) => state.queries.filters,
};

export default queriesSlice.reducer;