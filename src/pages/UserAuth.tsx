
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserLoginForm from "@/components/auth/UserLoginForm";

const UserAuth = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <UserLoginForm />
      </main>
      <Footer />
    </div>
  );
};

export default UserAuth;
