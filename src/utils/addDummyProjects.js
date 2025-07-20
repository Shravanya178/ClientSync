import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

// Dummy projects data - Limited to 6 projects
const dummyProjects = [
  // User 1 projects
  {
    name: "E-commerce Website Redesign",
    description: "Complete redesign of the company's e-commerce platform with modern UI/UX, improved performance, and mobile responsiveness.",
    clientEmail: "john.doe@example.com",
    progress: 75,
    status: "active",
    deadline: new Date("2025-08-15"),
    createdBy: "Admin",
    lastComment: "Design mockups approved. Moving to development phase. Expected completion by next week.",
    lastCommentBy: "Sarah Wilson - Project Manager",
    lastCommentAt: serverTimestamp(),
  },
  {
    name: "Mobile App Development",
    description: "Native iOS and Android app for customer engagement with push notifications, user profiles, and analytics.",
    clientEmail: "john.doe@example.com",
    progress: 45,
    status: "active", 
    deadline: new Date("2025-09-30"),
    createdBy: "Admin",
    lastComment: "API integration completed. Working on user authentication and profile management features.",
    lastCommentBy: "Mike Chen - Lead Developer",
    lastCommentAt: serverTimestamp(),
  },

  // User 2 projects
  {
    name: "CRM System Integration",
    description: "Integration of Salesforce CRM with existing business systems, data migration, and staff training.",
    clientEmail: "jane.smith@company.com",
    progress: 60,
    status: "active",
    deadline: new Date("2025-08-20"),
    createdBy: "Admin",
    lastComment: "Data migration phase completed successfully. Starting user training sessions next Monday.",
    lastCommentBy: "Alex Rodriguez - Systems Analyst",
    lastCommentAt: serverTimestamp(),
  },
  {
    name: "Digital Marketing Campaign",
    description: "Multi-channel digital marketing campaign including SEO, social media, and PPC advertising strategy.",
    clientEmail: "jane.smith@company.com",
    progress: 30,
    status: "active",
    deadline: new Date("2025-10-15"),
    createdBy: "Admin",
    lastComment: "Keyword research and competitor analysis completed. Setting up Google Ads campaigns this week.",
    lastCommentBy: "Lisa Park - Marketing Specialist",
    lastCommentAt: serverTimestamp(),
  },

  // User 3 projects
  {
    name: "Cloud Migration Project",
    description: "Migration of on-premise infrastructure to AWS cloud with security implementation and cost optimization.",
    clientEmail: "robert.johnson@tech.io",
    progress: 85,
    status: "active",
    deadline: new Date("2025-07-30"),
    createdBy: "Admin",
    lastComment: "Server migration completed. Running final security tests and performance optimization.",
    lastCommentBy: "David Kumar - Cloud Architect",
    lastCommentAt: serverTimestamp(),
  },
  {
    name: "Website Performance Optimization",
    description: "Optimization of website loading speed, SEO improvements, and conversion rate optimization.",
    clientEmail: "robert.johnson@tech.io",
    progress: 100,
    status: "completed",
    deadline: new Date("2025-07-10"),
    createdBy: "Admin",
    lastComment: "Project completed successfully! Website speed improved by 60%. SEO rankings increased significantly.",
    lastCommentBy: "Tom Anderson - Performance Specialist",
    lastCommentAt: serverTimestamp(),
  }
];

export const addDummyProjects = async () => {
  try {
    console.log("Adding dummy projects to database...");
    
    const projectsRef = collection(db, "projects");
    
    for (const project of dummyProjects) {
      await addDoc(projectsRef, {
        ...project,
        createdAt: serverTimestamp(),
      });
      console.log(`Added project: ${project.name} for ${project.clientEmail}`);
    }
    
    console.log("✅ All dummy projects added successfully!");
    return true;
  } catch (error) {
    console.error("Error adding dummy projects:", error);
    return false;
  }
};

// Uncomment the line below to run this function
// addDummyProjects();
