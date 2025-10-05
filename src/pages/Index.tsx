import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Search, MessageSquare, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
const Index = () => {
  return <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-yaracheck-blue to-yaracheck-darkBlue text-white py-12 sm:py-20">
          <div className="yaracheck-container">
            <div className="max-w-4xl mx-auto text-center px-4">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 text-black">
                Report. Track. Stay Safe.
              </h1>
              
              <div className="text-lg sm:text-xl space-y-4 mb-8">
                <p className="font-semibold text-xl sm:text-2xl">WORLD'S MOST RELIABLE PLATFORM FOR "REPORTING" AND TRACKING:</p>
                
                <div className="space-y-3 text-left max-w-2xl mx-auto">
                  <p className="flex items-center">
                    <span className="mr-3">🔎</span>
                    <span>Stolen or Missing Items</span>
                  </p>
                  <p className="flex items-center">
                    <span className="mr-3">🧍🏽‍♂️</span>
                    <span>Missing Persons & Pets</span>
                  </p>
                  <p className="flex items-center">
                    <span className="mr-3">🔐</span>
                    <span>Scam/Suspected Emails/Social Media Accounts</span>
                  </p>
                  <p className="flex items-center">
                    <span className="mr-3">💼</span>
                    <span>Scammers and Fraudsters...</span>
                  </p>
                </div>
                
                <p className="font-medium text-lg pt-4">
                  ...Report. Track. Stay Safe!
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" className="bg-yaracheck-orange hover:bg-amber-600 text-white w-full sm:w-auto">
                  <Link to="/submit-report">Submit A Report Urgently</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white text-yaracheck-blue hover:bg-gray-100 w-full sm:w-auto">
                  <Link to="/verify-item">Verify Before Purchase</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 sm:py-20 bg-gray-50">
          <div className="yaracheck-container">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-yaracheck-darkBlue px-4">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4">
              <Card className="border-t-4 border-t-yaracheck-blue shadow-md">
                <CardContent className="pt-6 text-center">
                  <div className="rounded-full bg-yaracheck-lightBlue p-3 w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                    <AlertTriangle className="h-8 w-8 text-yaracheck-blue flex-shrink-0" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Report</h3>
                  <p className="text-yaracheck-darkGray">Submit details of your stolen item or missing person or hacked social media account. Each report generates a unique tracking code after a small one-time fee.</p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-yaracheck-orange shadow-md">
                <CardContent className="pt-6 text-center">
                  <div className="rounded-full bg-amber-100 p-3 w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                    <Search className="h-8 w-8 text-yaracheck-orange flex-shrink-0" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Verify</h3>
                  <p className="text-yaracheck-darkGray">
                    Before purchasing any used item, check if it has been reported
                    stolen by entering its IMEI, serial number, or chassis number.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-green-500 shadow-md">
                <CardContent className="pt-6 text-center">
                  <div className="rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                    <MessageSquare className="h-8 w-8 text-green-600 flex-shrink-0" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Tip & Recover</h3>
                  <p className="text-yaracheck-darkGray">
                    Send anonymous tips on reported items or persons. Track updates
                    on your report and mark as resolved when recovered.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 sm:py-20">
          <div className="yaracheck-container">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 sm:mb-16 text-yaracheck-darkBlue px-4">
              Why Choose YaraCheck
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center px-4">
              <div>
                <img src="/lovable-uploads/eeb1eab5-4663-488a-b9e9-3b3dde432a88.png" alt="YaraCheck Logo" className="rounded-lg shadow-lg w-full" />
              </div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-yaracheck-lightBlue rounded-full p-2 mt-1 flex-shrink-0">
                    <Check className="h-5 w-5 text-yaracheck-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">Secure Verification</h3>
                    <p className="text-yaracheck-darkGray">
                      Our platform allows you to verify any item before purchase,
                      protecting you from buying stolen goods.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-yaracheck-lightBlue rounded-full p-2 mt-1 flex-shrink-0">
                    <Check className="h-5 w-5 text-yaracheck-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">Anonymous Tips</h3>
                    <p className="text-yaracheck-darkGray">
                      Submit anonymous tips or sightings on reported items or missing
                      persons without revealing your identity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-yaracheck-lightBlue rounded-full p-2 mt-1 flex-shrink-0">
                    <Check className="h-5 w-5 text-yaracheck-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">Track Updates</h3>
                    <p className="text-yaracheck-darkGray">
                      Each report comes with a unique tracking code allowing you to
                      follow progress and receive updates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-yaracheck-lightBlue rounded-full p-2 mt-1 flex-shrink-0">
                    <Check className="h-5 w-5 text-yaracheck-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">Global Coverage</h3>
                    <p className="text-yaracheck-darkGray">Our platform covers every country, helping people track and find their belongings across the world.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-yaracheck-blue py-12 sm:py-16 text-white">
          <div className="yaracheck-container text-center px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">"Before You Buy It or Deal, YaraCheck."</h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto">Don't risk purchasing stolen property. Verify first and protect yourself and your community. Have you lost an item? Flag it quickly and increase your chances of finding it! Did you receive a scam sms, mail, call from an account? Flag the account so others can YaraCheck it to stop further damage!</p>
            <Button asChild size="lg" className="bg-yaracheck-orange hover:bg-amber-600 text-white w-full sm:w-auto">
              <Link to="/verify-item">Verify an Item Now</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>;
};
export default Index;