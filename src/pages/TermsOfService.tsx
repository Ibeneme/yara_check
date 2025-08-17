
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="yaracheck-container py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-yaracheck-blue">
                Terms of Service
              </CardTitle>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Acceptance of Terms</h2>
                  <p className="text-gray-700">
                    By accessing and using YaraCheck's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Description of Service</h2>
                  <p className="text-gray-700">
                    YaraCheck provides a platform for reporting and verifying lost or stolen items, missing persons, and compromised accounts. Our services include:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Report submission and verification services</li>
                    <li>Item and person verification database</li>
                    <li>Communication facilitation between parties</li>
                    <li>Analytics and reporting tools</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">User Responsibilities</h2>
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Accurate Information</h3>
                    <p className="text-gray-700">
                      You agree to provide accurate, complete, and current information when submitting reports or creating accounts.
                    </p>
                    
                    <h3 className="text-lg font-medium">Lawful Use</h3>
                    <p className="text-gray-700">
                      You agree to use our services only for lawful purposes and in compliance with all applicable laws and regulations.
                    </p>
                    
                    <h3 className="text-lg font-medium">Account Security</h3>
                    <p className="text-gray-700">
                      You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Prohibited Activities</h2>
                  <p className="text-gray-700">You agree not to:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Submit false or misleading information</li>
                    <li>Use the service for fraudulent purposes</li>
                    <li>Interfere with or disrupt the service</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Violate any applicable laws or regulations</li>
                    <li>Harass or intimidate other users</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Fees and Payments</h2>
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Service Fees</h3>
                    <p className="text-gray-700">
                      A fee of $8 USD is required for each report submission to maintain our verification systems and cover operational costs.
                    </p>
                    
                    <h3 className="text-lg font-medium">Payment Terms</h3>
                    <p className="text-gray-700">
                      All fees are due immediately upon report submission. We accept major credit cards and process payments through secure third-party providers.
                    </p>
                    
                    <h3 className="text-lg font-medium">Refund Policy</h3>
                    <p className="text-gray-700">
                      Fees are generally non-refundable once a report has been processed. Refunds may be considered in exceptional circumstances at our sole discretion.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Intellectual Property</h2>
                  <p className="text-gray-700">
                    All content and materials on YaraCheck, including but not limited to text, graphics, logos, and software, are the property of YaraCheck or its licensors and are protected by copyright and other intellectual property laws.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Disclaimer of Warranties</h2>
                  <p className="text-gray-700">
                    YaraCheck provides its services "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or reliability of any information on our platform. Use of our services is at your own risk.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Limitation of Liability</h2>
                  <p className="text-gray-700">
                    YaraCheck shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of our services, even if we have been advised of the possibility of such damages.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Privacy</h2>
                  <p className="text-gray-700">
                    Your privacy is important to us. Please review our Privacy Policy, which also governs your use of our services, to understand our practices.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Termination</h2>
                  <p className="text-gray-700">
                    We may terminate or suspend your access to our services immediately, without prior notice, for any reason, including breach of these Terms of Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Changes to Terms</h2>
                  <p className="text-gray-700">
                    We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service constitutes acceptance of the modified terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Governing Law</h2>
                  <p className="text-gray-700">
                    These terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Contact Information</h2>
                  <p className="text-gray-700">
                    If you have any questions about these Terms of Service, please contact us at:
                  </p>
                  <div className="mt-3 text-gray-700">
                    <p>Email: legal@yaracheck.com</p>
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

export default TermsOfService;
