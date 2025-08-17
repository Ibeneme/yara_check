
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="yaracheck-container py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-yaracheck-blue">
                Privacy Policy
              </CardTitle>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Introduction</h2>
                  <p className="text-gray-700">
                    Welcome to YaraCheck. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Information We Collect</h2>
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                      <li>Name and contact information (email, phone number, address)</li>
                      <li>Payment information for report submission fees</li>
                      <li>Account credentials and authentication data</li>
                      <li>Report details including descriptions, locations, and photos</li>
                    </ul>
                    
                    <h3 className="text-lg font-medium">Usage Information</h3>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                      <li>IP address and device information</li>
                      <li>Browser type and version</li>
                      <li>Pages visited and time spent on our platform</li>
                      <li>Search queries and verification requests</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">How We Use Your Information</h2>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Process and verify reports of missing persons, stolen items, and compromised accounts</li>
                    <li>Facilitate communication between reporters and relevant parties</li>
                    <li>Process payments and maintain financial records</li>
                    <li>Improve our services and user experience</li>
                    <li>Send important updates and notifications</li>
                    <li>Comply with legal obligations and law enforcement requests</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Information Sharing</h2>
                  <p className="text-gray-700 mb-3">We may share your information in the following circumstances:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>With law enforcement agencies when required by law or to assist in investigations</li>
                    <li>With third-party service providers who assist in our operations (payment processors, hosting services)</li>
                    <li>With your explicit consent for specific purposes</li>
                    <li>In emergency situations to protect life and safety</li>
                    <li>In connection with a business transfer or merger</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Data Security</h2>
                  <p className="text-gray-700">
                    We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Your Rights</h2>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Request deletion of your data (subject to legal requirements)</li>
                    <li>Opt-out of non-essential communications</li>
                    <li>Data portability where applicable</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Cookies and Tracking</h2>
                  <p className="text-gray-700">
                    We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">International Transfers</h2>
                  <p className="text-gray-700">
                    Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Changes to This Policy</h2>
                  <p className="text-gray-700">
                    We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Contact Us</h2>
                  <p className="text-gray-700">
                    If you have questions about this Privacy Policy or our data practices, please contact us at:
                  </p>
                  <div className="mt-3 text-gray-700">
                    <p>Email: privacy@yaracheck.com</p>
                    <p>Phone: +2347047906867</p>
                    <p>Address: 5, Military Lane, Port Harcourt</p>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
