
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="yaracheck-container py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-yaracheck-blue">
                Cookie Policy
              </CardTitle>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">What Are Cookies</h2>
                  <p className="text-gray-700">
                    Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">How We Use Cookies</h2>
                  <p className="text-gray-700">
                    YaraCheck uses cookies to enhance your experience on our platform. We use cookies for the following purposes:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>To remember your login status and preferences</li>
                    <li>To analyze website traffic and user behavior</li>
                    <li>To improve our services and user experience</li>
                    <li>To provide personalized content and recommendations</li>
                    <li>To ensure the security of our platform</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Types of Cookies We Use</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-yaracheck-blue">Essential Cookies</h3>
                      <p className="text-gray-700">
                        These cookies are necessary for the website to function properly. They enable basic features like page navigation, access to secure areas, and authentication.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-yaracheck-blue">Analytics Cookies</h3>
                      <p className="text-gray-700">
                        These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our services.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-yaracheck-blue">Functional Cookies</h3>
                      <p className="text-gray-700">
                        These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-yaracheck-blue">Performance Cookies</h3>
                      <p className="text-gray-700">
                        These cookies collect information about how you use our website, such as which pages you visit most often, to help us optimize performance.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Third-Party Cookies</h2>
                  <p className="text-gray-700">
                    We may also use third-party services that set cookies on your device. These include:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Payment processors (Stripe, Paystack, Flutterwave) for secure payment processing</li>
                    <li>Authentication services (Supabase) for user login and security</li>
                    <li>Analytics services to understand user behavior and improve our platform</li>
                    <li>Social media platforms (Facebook, Twitter, YouTube) for content sharing</li>
                    <li>Content delivery networks for improved performance and global access</li>
                    <li>Language detection services for automatic localization</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Cookie Duration</h2>
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Session Cookies</h3>
                    <p className="text-gray-700">
                      These cookies are temporary and are deleted when you close your browser. They are used to maintain your session while you browse our website.
                    </p>
                    
                    <h3 className="text-lg font-medium">Persistent Cookies</h3>
                    <p className="text-gray-700">
                      These cookies remain on your device for a set period or until you delete them. They are used to remember your preferences and improve your experience on return visits.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Managing Cookies</h2>
                  <p className="text-gray-700 mb-3">
                    You have several options for managing cookies:
                  </p>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Browser Settings</h3>
                    <p className="text-gray-700">
                      Most web browsers allow you to control cookies through their settings. You can:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                      <li>Block all cookies</li>
                      <li>Allow cookies from specific sites</li>
                      <li>Delete existing cookies</li>
                      <li>Be notified when cookies are set</li>
                    </ul>
                    
                    <h3 className="text-lg font-medium">Browser-Specific Instructions</h3>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                      <li>Chrome: Settings → Privacy and Security → Cookies and other site data</li>
                      <li>Firefox: Options → Privacy & Security → Cookies and Site Data</li>
                      <li>Safari: Preferences → Privacy → Cookies and website data</li>
                      <li>Edge: Settings → Cookies and site permissions</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Impact of Disabling Cookies</h2>
                  <p className="text-gray-700">
                    While you can disable cookies, please note that this may affect your experience on our website. Some features may not work properly, and you may need to re-enter information more frequently.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Updates to This Policy</h2>
                  <p className="text-gray-700">
                    We may update this Cookie Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any significant changes by posting the updated policy on our website.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-yaracheck-blue mb-3">Contact Us</h2>
                  <p className="text-gray-700">
                    If you have any questions about our use of cookies or this Cookie Policy, please contact us at:
                  </p>
                  <div className="mt-3 text-gray-700">
                    <p>Email: info@yaracheck.com</p>
                    <p>Phone: +447405672016 (WhatsApp)</p>
                    <p>Address: Stoke Park Mews, St Michaels Road, Coventry CV2 4NU</p>
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

export default CookiePolicy;
