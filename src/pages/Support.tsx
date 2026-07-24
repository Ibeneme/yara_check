import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LiveChat from "@/components/chat/LiveChat";
import {
  HelpCircle,
  MessageSquare,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  AlertCircle,
  User,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Support = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [showChat, setShowChat] = useState(false);

  const startChat = () => {
    if (!userEmail.trim()) {
      toast.error("Please enter your email address to start chatting");
      return;
    }
    setShowChat(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(
      "Support ticket submitted successfully! We'll get back to you soon."
    );
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
      priority: "medium",
    });
    setIsSubmitting(false);
  };

  const faqs = [
    {
      question: "What is YaraCheck?",
      answer:
        "YaraCheck is a comprehensive platform designed to help people report and track missing persons, stolen devices, and stolen vehicles. Our system helps connect victims with their lost items and missing loved ones through a network of verified reports and community assistance around the world.",
    },
    {
      question: "How do I report a missing person or stolen item?",
      answer:
        "To report a missing person or stolen item, click on 'Submit Report' in the main navigation. You'll be guided through a simple form where you can provide details about the missing person or stolen item, including photos and relevant information. The more details you provide, the better chance of recovery.",
    },
    {
      question: "Is there a fee for reporting?",
      answer:
        "Missing persons aged 1-5 are reported free of charge. For all other report categories (older missing persons, stolen devices, vehicles, household items, personal belongings, hacked accounts, and business reputation reports), there is a small fee to help maintain our verification systems and cover operational costs.",
    },
    {
      question: "How can I verify if an item is stolen before purchasing?",
      answer:
        "Use our 'Verify an Item' feature to check if a device or vehicle has been reported as stolen. Simply enter the IMEI number for devices or chassis number for vehicles. This helps prevent the purchase of stolen goods and aids in recovery efforts.",
    },
    {
      question: "What information do I need to provide when reporting?",
      answer:
        "For missing persons: Name, age, physical description, last known location, and a recent photo. For stolen devices: Brand, model, color, IMEI number, and circumstances of theft. For stolen vehicles: Make, model, year, color, chassis number, and location of theft.",
    },
    {
      question: "How long do reports stay active?",
      answer:
        "Reports remain active until the person is found or the item is recovered. You can update the status of your report at any time through your account dashboard.",
    },
    {
      question: "Can I report anonymously?",
      answer:
        "While we encourage creating an account for better tracking and updates, you can submit reports with minimal personal information. However, having contact information helps us reach you with potential matches or updates.",
    },
    {
      question:
        "What should I do if I find information about a missing person or stolen item?",
      answer:
        "If you have information about a missing person or stolen item, use the contact information provided in the report to reach out directly to the reporter. You can also send anonymous messages through our platform if you prefer not to share your contact details.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-[#F1F0EC] text-[#0B1220] font-sans pb-24">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden noise pt-16 pb-12">
          {/* Subtle background diamonds for visual interest */}
          <div className="absolute inset-0 -z-0 opacity-40">
            <div
              className="diamond w-64 h-64 -top-10 left-[12%]"
              style={
                { "--d1": "#FFD9CC", "--d2": "#FFB199" } as React.CSSProperties
              }
            />
            <div
              className="diamond w-56 h-56 top-10 right-[15%]"
              style={
                { "--d1": "#CFE0FF", "--d2": "#9FC1FF" } as React.CSSProperties
              }
            />
          </div>

          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-[#CFE0FF] flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#0B1220]/5">
              <HelpCircle className="h-8 w-8 text-[#2158D9]" />
            </div>

            <span className="font-mono text-[11px] uppercase tracking-[0.2em] bg-white/70 border border-[#0B1220]/10 rounded-full px-4 py-1.5 inline-block mb-4">
              24/7 Global Support Center
            </span>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
              Support Center
            </h1>

            <p className="text-[#0B1220]/70 text-lg max-w-2xl mx-auto leading-relaxed">
              We&apos;re here to help you with any questions or concerns about
              YaraCheck. Find answers to common questions or get in touch with
              our support team.
            </p>
          </div>
        </section>

        {/* CONTENT SECTION */}
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <Tabs defaultValue="faq" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white p-1.5 rounded-2xl border border-[#0B1220]/5 shadow-sm h-auto">
              <TabsTrigger
                value="faq"
                className="flex items-center gap-2 rounded-xl py-3 font-mono text-xs uppercase tracking-wider data-[state=active]:bg-[#0B1220] data-[state=active]:text-white"
              >
                <HelpCircle className="h-4 w-4" />
                FAQ
              </TabsTrigger>
              <TabsTrigger
                value="live-chat"
                className="flex items-center gap-2 rounded-xl py-3 font-mono text-xs uppercase tracking-wider data-[state=active]:bg-[#0B1220] data-[state=active]:text-white"
              >
                <MessageCircle className="h-4 w-4" />
                Live Chat
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="flex items-center gap-2 rounded-xl py-3 font-mono text-xs uppercase tracking-wider data-[state=active]:bg-[#0B1220] data-[state=active]:text-white"
              >
                <MessageSquare className="h-4 w-4" />
                Support Ticket
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className="flex items-center gap-2 rounded-xl py-3 font-mono text-xs uppercase tracking-wider data-[state=active]:bg-[#0B1220] data-[state=active]:text-white"
              >
                <User className="h-4 w-4" />
                Contact Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="faq">
              <div className="bg-white p-8 rounded-3xl border border-[#0B1220]/5 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#0B1220]/5">
                  <div className="w-10 h-10 rounded-xl bg-[#CFE0FF] flex items-center justify-center">
                    <HelpCircle className="h-5 w-5 text-[#2158D9]" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-2xl">
                      Frequently Asked Questions
                    </h2>
                    <p className="text-sm text-[#0B1220]/60">
                      Quick answers to common questions about reporting,
                      tracking, and fees.
                    </p>
                  </div>
                </div>

                <Accordion
                  type="single"
                  collapsible
                  className="w-full space-y-3"
                >
                  {faqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="border border-[#0B1220]/10 rounded-2xl px-6 data-[state=open]:bg-[#F8F8F7] transition-colors"
                    >
                      <AccordionTrigger className="text-left font-display font-medium text-lg py-4 hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-[#0B1220]/70 pb-4 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>

            <TabsContent value="live-chat">
              {!showChat ? (
                <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#0B1220]/5 shadow-sm text-center max-w-2xl mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-[#D6F5E7] flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="h-7 w-7 text-[#1BA672]" />
                  </div>
                  <h2 className="font-display font-semibold text-2xl mb-3">
                    Start Live Chat
                  </h2>
                  <p className="text-[#0B1220]/65 mb-8 leading-relaxed">
                    Chat with our support team in real-time. Please provide your
                    contact information to get started.
                  </p>

                  <div className="space-y-4 text-left mb-8">
                    <div>
                      <Label
                        htmlFor="chat-email"
                        className="font-mono text-xs uppercase tracking-wider text-[#0B1220]/60 block mb-2"
                      >
                        Email Address *
                      </Label>
                      <Input
                        id="chat-email"
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="rounded-xl bg-[#F8F8F7] border-[#0B1220]/10 py-3"
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="chat-name"
                        className="font-mono text-xs uppercase tracking-wider text-[#0B1220]/60 block mb-2"
                      >
                        Your Name (Optional)
                      </Label>
                      <Input
                        id="chat-name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Your full name"
                        className="rounded-xl bg-[#F8F8F7] border-[#0B1220]/10 py-3"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={startChat}
                    className="w-full bg-[#0B1220] hover:bg-[#FF5A36] text-white rounded-xl py-6 font-semibold transition-colors"
                  >
                    Start Live Chat
                  </Button>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-[#0B1220]/5 shadow-sm overflow-hidden">
                  <LiveChat
                    userEmail={userEmail}
                    userName={userName || undefined}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="contact">
              <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#0B1220]/5 shadow-sm text-center max-w-2xl mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-[#FFE9E2] flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-7 w-7 text-[#FF5A36]" />
                </div>
                <h2 className="font-display font-semibold text-2xl mb-3">
                  Submit a Support Ticket
                </h2>
                <p className="text-[#0B1220]/65 mb-8 leading-relaxed">
                  Need help with something specific? Submit a detailed support
                  ticket and our team will get back to you promptly.
                </p>
                <Button
                  asChild
                  className="bg-[#0B1220] hover:bg-[#FF5A36] text-white rounded-xl px-8 py-6 font-semibold transition-colors"
                >
                  <Link to="/contact-support">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Support Ticket
                  </Link>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="info">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-[#0B1220]/5 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-[#0B1220]/5">
                    <div className="w-10 h-10 rounded-xl bg-[#CFE0FF] flex items-center justify-center">
                      <Phone className="h-5 w-5 text-[#2158D9]" />
                    </div>
                    <h3 className="font-display font-semibold text-xl">
                      Phone Support
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#DCE7FF] p-2.5 rounded-xl">
                        <Phone className="h-4 w-4 text-[#2158D9]" />
                      </div>
                      <div>
                        <p className="font-medium">WhatsApp Support</p>
                        <p className="font-mono text-sm text-[#0B1220]/60">
                          +447405672016 (WhatsApp)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#D6F5E7] p-2.5 rounded-xl">
                        <Clock className="h-4 w-4 text-[#1BA672]" />
                      </div>
                      <div>
                        <p className="font-medium">Available 24/7</p>
                        <p className="text-sm text-[#0B1220]/60">
                          Always here when you need us
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-[#0B1220]/5 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-[#0B1220]/5">
                    <div className="w-10 h-10 rounded-xl bg-[#FFE9E2] flex items-center justify-center">
                      <Mail className="h-5 w-5 text-[#FF5A36]" />
                    </div>
                    <h3 className="font-display font-semibold text-xl">
                      Email &amp; Address
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#CFE0FF] p-2.5 rounded-xl">
                        <Mail className="h-4 w-4 text-[#2158D9]" />
                      </div>
                      <div>
                        <p className="font-medium">General Inquiries</p>
                        <p className="font-mono text-sm text-[#0B1220]/60">
                          support@yaracheck.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#FFE9E2] p-2.5 rounded-xl">
                        <AlertCircle className="h-4 w-4 text-[#FF5A36]" />
                      </div>
                      <div>
                        <p className="font-medium">Emergency Reports</p>
                        <p className="font-mono text-sm text-[#0B1220]/60">
                          info@yaracheck.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-[#D6F5E7] p-2.5 rounded-xl mt-1">
                        <MapPin className="h-4 w-4 text-[#1BA672]" />
                      </div>
                      <div>
                        <p className="font-medium">Headquarters</p>
                        <p className="text-sm text-[#0B1220]/60 leading-relaxed">
                          YaraCheck Global
                          <br />
                          Stoke Park Mews
                          <br />
                          St Michaels Road
                          <br />
                          Coventry CV2 4NU
                          <br />
                          United Kingdom
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-[#0B1220]/5 shadow-sm mt-6">
                <h3 className="font-display font-semibold text-xl mb-6 text-center">
                  Response Times
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-6 bg-[#FFE9E2]/50 border border-[#FF5A36]/20 rounded-2xl">
                    <span className="font-mono text-[10px] uppercase tracking-wider bg-[#FFE9E2] text-[#FF5A36] px-2.5 py-1 rounded-full font-semibold inline-block mb-3">
                      High Priority
                    </span>
                    <p className="text-3xl font-display font-semibold text-[#FF5A36] mb-1">
                      1-2 hours
                    </p>
                    <p className="text-xs text-[#0B1220]/60">
                      Emergency situations
                    </p>
                  </div>
                  <div className="text-center p-6 bg-[#FFE7A8]/40 border border-[#E5A910]/20 rounded-2xl">
                    <span className="font-mono text-[10px] uppercase tracking-wider bg-[#FFE7A8] text-[#8E6500] px-2.5 py-1 rounded-full font-semibold inline-block mb-3">
                      Medium Priority
                    </span>
                    <p className="text-3xl font-display font-semibold text-[#B3830C] mb-1">
                      4-8 hours
                    </p>
                    <p className="text-xs text-[#0B1220]/60">
                      Technical issues
                    </p>
                  </div>
                  <div className="text-center p-6 bg-[#CFE0FF]/40 border border-[#2158D9]/20 rounded-2xl">
                    <span className="font-mono text-[10px] uppercase tracking-wider bg-[#CFE0FF] text-[#2158D9] px-2.5 py-1 rounded-full font-semibold inline-block mb-3">
                      Low Priority
                    </span>
                    <p className="text-3xl font-display font-semibold text-[#2158D9] mb-1">
                      24-48 hours
                    </p>
                    <p className="text-xs text-[#0B1220]/60">
                      General inquiries
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;
