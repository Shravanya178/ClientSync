// Sample data for testing ClientSync features

export const sampleUsers = [
  {
    uid: "admin_001",
    email: "admin@clientsync.com",
    displayName: "Admin User",
    role: "admin",
    createdAt: new Date(),
  },
  {
    uid: "client_shrav",
    email: "shrav@example.com",
    displayName: "Shravanya",
    role: "client",
    createdAt: new Date(),
  },
  {
    uid: "client_sank",
    email: "sank@example.com",
    displayName: "Sankalp",
    role: "client",
    createdAt: new Date(),
  },
  {
    uid: "client_khus",
    email: "khus@example.com",
    displayName: "Khushi",
    role: "client",
    createdAt: new Date(),
  },
  {
    uid: "client_nikh",
    email: "nikh@example.com",
    displayName: "Nikhil",
    role: "client",
    createdAt: new Date(),
  },
];

export const sampleDeliverables = [
  {
    id: "del_001",
    title: "Website Landing Page Design",
    description: "Create a modern, responsive landing page design",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    priority: "high",
    status: "in-progress",
    clientId: "client_shrav",
    createdBy: "admin_001",
    hasActiveHelpRequest: false,
  },
  {
    id: "del_002",
    title: "Mobile App UI/UX",
    description: "Design user interface for the mobile application",
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    priority: "medium",
    status: "pending",
    clientId: "client_sank",
    createdBy: "admin_001",
    hasActiveHelpRequest: true,
  },
  {
    id: "del_003",
    title: "Logo and Brand Guidelines",
    description: "Complete brand identity package with logo variations",
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    priority: "high",
    status: "completed",
    clientId: "client_khus",
    createdBy: "admin_001",
    hasActiveHelpRequest: false,
  },
];

export const sampleUpdates = [
  {
    id: "upd_001",
    title: "Weekly Project Progress Update",
    description: "All projects are progressing well. Website designs are in final review.",
    type: "general",
    author: "Admin User",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: "upd_002",
    title: "Your landing page design is ready for review",
    description: "Please check the new design files uploaded to your deliverable.",
    type: "client-specific",
    targetClientId: "client_shrav",
    author: "Admin User",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: "upd_003",
    title: "System Maintenance Scheduled",
    description: "Brief maintenance window this weekend for system updates.",
    type: "announcement",
    author: "Admin User",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
];

export const sampleHelpRequests = [
  {
    id: "help_001",
    deliverableId: "del_002",
    deliverableTitle: "Mobile App UI/UX",
    clientId: "client_sank",
    clientName: "Sankalp",
    clientEmail: "sank@example.com",
    type: "googlemeet",
    description: "I'd like to discuss the app flow and user journey in detail",
    preferredTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    urgency: "medium",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "help_002",
    deliverableId: "del_001",
    deliverableTitle: "Website Landing Page Design",
    clientId: "client_shrav",
    clientName: "Shravanya",
    clientEmail: "shrav@example.com",
    type: "callback",
    description: "Need clarification on the color scheme and branding requirements",
    preferredTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    urgency: "high",
    status: "in-progress",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
];

// Instructions for setting up test data
export const setupInstructions = `
To test the ClientSync features:

1. ADMIN LOGIN:
   - Go to /admin-login
   - Use: admin@clientsync.com / password123
   - Or create an admin user and set role: "admin" in Firestore

2. CLIENT LOGIN:
   - Go to /client-login  
   - Use any email/password or Google login
   - Role will automatically be set to "client"

3. TEST FEATURES:
   - Admin can create deliverables and assign to clients
   - Clients can request help via multiple channels
   - Real-time updates and notifications
   - File uploads for voice notes and resources
   - Role-based access control

4. DATABASE STRUCTURE:
   - users: { uid, email, displayName, role, createdAt }
   - deliverables: { title, description, deadline, priority, status, clientId, hasActiveHelpRequest }
   - helpRequests: { deliverableId, clientId, type, description, preferredTime, urgency, status }
   - updates: { title, description, type, targetClientId, author, createdAt }
   - files: { deliverableId, uploadedBy, type, files[], description, createdAt }
`;

export default {
  sampleUsers,
  sampleDeliverables,
  sampleUpdates,
  sampleHelpRequests,
  setupInstructions,
};