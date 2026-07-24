import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserLoginForm from "@/components/auth/UserLoginForm";

const UserAuth = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <UserLoginForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserAuth;
