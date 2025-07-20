import React from "react";
import ClientProfile from "./ClientProfile";

const Profile = ({ user, isAdminView }) => {
  return <ClientProfile user={user} isAdminView={isAdminView} />;
};

export default Profile;
