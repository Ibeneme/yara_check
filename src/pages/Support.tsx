import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LiveChat from "@/components/chat/LiveChat";
import { HelpCircle, MessageSquare, MessageCircle, Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertCircle, User } from "lucide-react";
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
    priority: "medium"
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Support ticket submitted successfully! We'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
      priority: "medium"
    });
    setIsSubmitting(false);
  };
  const faqs = [{
    question: "What is YaraCheck?",
    answer: "YaraCheck is a comprehensive platform designed to help people report and track missing persons, stolen devices, and stolen vehicles. Our system helps connect victims with their lost items and missing loved ones through a network of verified reports and community assistance around the world."
  }, {
    question: "How do I report a missing person or stolen item?",
    answer: "To report a missing person or stolen item, click on 'Submit Report' in the main navigation. You'll be guided through a simple form where you can provide details about the missing person or stolen item, including photos and relevant information. The more details you provide, the better chance of recovery."
  }, {
    question: "Is there a fee for reporting?",
    answer: "Missing persons aged 1-5 are reported free of charge. For all other report categories (older missing persons, stolen devices, vehicles, household items, personal belongings, hacked accounts, and business reputation reports), there is a small fee to help maintain our verification systems and cover operational costs."
  }, {
    question: "How can I verify if an item is stolen before purchasing?",
    answer: "Use our 'Verify an Item' feature to check if a device or vehicle has been reported as stolen. Simply enter the IMEI number for devices or chassis number for vehicles. This helps prevent the purchase of stolen goods and aids in recovery efforts."
  }, {
    question: "What information do I need to provide when reporting?",
    answer: "For missing persons: Name, age, physical description, last known location, and a recent photo. For stolen devices: Brand, model, color, IMEI number, and circumstances of theft. For stolen vehicles: Make, model, year, color, chassis number, and location of theft."
  }, {
    question: "How long do reports stay active?",
    answer: "Reports remain active until the person is found or the item is recovered. You can update the status of your report at any time through your account dashboard."
  }, {
    question: "Can I report anonymously?",
    answer: "While we encourage creating an account for better tracking and updates, you can submit reports with minimal personal information. However, having contact information helps us reach you with potential matches or updates."
  }, {
    question: "What should I do if I find information about a missing person or stolen item?",
    answer: "If you have information about a missing person or stolen item, use the contact information provided in the report to reach out directly to the reporter. You can also send anonymous messages through our platform if you prefer not to share your contact details."
  }];
  return <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="yaracheck-container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-yaracheck-blue mb-4">
              Support Center
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're here to help you with any questions or concerns about YaraCheck. 
              Find answers to common questions or get in touch with our support team.
            </p>
          </div>

          <Tabs defaultValue="faq" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="faq" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </TabsTrigger>
              <TabsTrigger value="live-chat" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Live Chat
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Contact Support
              </TabsTrigger>
              <TabsTrigger value="info" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="faq">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-yaracheck-blue" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>)}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="live-chat">
              {!showChat ? <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-yaracheck-blue" />
                      Start Live Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">
                      Chat with our support team in real-time. Please provide your contact information to get started.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="chat-email">Email Address *</Label>
                        <Input id="chat-email" type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} placeholder="your.email@example.com" required />
                      </div>
                      <div>
                        <Label htmlFor="chat-name">Your Name (Optional)</Label>
                        <Input id="chat-name" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Your full name" />
                      </div>
                    </div>

                    <Button onClick={startChat} className="w-full bg-yaracheck-blue hover:bg-yaracheck-darkBlue">
                      Start Live Chat
                    </Button>
                  </CardContent>
                </Card> : <LiveChat userEmail={userEmail} userName={userName || undefined} />}
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-yaracheck-blue" />
                    Submit a Support Ticket
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Need help with something specific? Submit a detailed support ticket and our team will get back to you.
                    </p>
                    <Button asChild className="bg-yaracheck-blue hover:bg-yaracheck-darkBlue">
                      <Link to="/contact-support">
                        <Send className="h-4 w-4 mr-2" />
                        Submit Support Ticket
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="legacy-contact">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-yaracheck-blue" />
                    Legacy Form (Demo Only)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <Input id="name" name="name" type="text" required value={formData.name} onChange={handleInputChange} placeholder="Enter your full name" />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <Input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} placeholder="Enter your email address" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <Input id="subject" name="subject" type="text" required value={formData.subject} onChange={handleInputChange} placeholder="Brief description of your issue" />
                    </div>

                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                        Priority Level
                      </label>
                      <select id="priority" name="priority" value={formData.priority} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yaracheck-blue focus:border-transparent">
                        <option value="low">Low - General inquiry</option>
                        <option value="medium">Medium - Account or technical issue</option>
                        <option value="high">High - Urgent assistance needed</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <Textarea id="message" name="message" required value={formData.message} onChange={handleInputChange} placeholder="Please provide detailed information about your issue or question" className="min-h-[120px]" />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full bg-yaracheck-blue hover:bg-yaracheck-darkBlue">
                      {isSubmitting ? <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </> : <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Support Ticket
                        </>}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-yaracheck-blue" />
                      Phone Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-yaracheck-lightBlue p-2 rounded-full">
                        <Phone className="h-4 w-4 text-yaracheck-blue" />
                      </div>
                      <div>
                        <p className="font-medium">WhatsApp Support</p>
                        <p className="text-gray-600">+447405672016 (WhatsApp)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Available 24/7</p>
                        <p className="text-gray-600">Always here when you need us</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-yaracheck-blue" />
                      Email & Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-yaracheck-lightBlue p-2 rounded-full">
                        <Mail className="h-4 w-4 text-yaracheck-blue" />
                      </div>
                      <div>
                        <p className="font-medium">General Inquiries</p>
                        <p className="text-gray-600">support@yaracheck.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 p-2 rounded-full">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">Emergency Reports</p>
                        <p className="text-gray-600">info@yaracheck.com</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-yaracheck-lightBlue p-2 rounded-full">
                        <MapPin className="h-4 w-4 text-yaracheck-blue" />
                      </div>
                      <div>
                        <p className="font-medium">Headquarters</p>
                        <p className="text-gray-600">
                          YaraCheck Global<br />
                          Stoke Park Mews<br />
                          St Michaels Road<br />
                          Coventry CV2 4NU<br />
                          United Kingdom
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Response Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Badge variant="outline" className="mb-2 border-green-500 text-green-700">
                        High Priority
                      </Badge>
                      <p className="text-2xl font-bold text-green-600">1-2 hours</p>
                      <p className="text-sm text-gray-600">Emergency situations</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <Badge variant="outline" className="mb-2 border-yellow-500 text-yellow-700">
                        Medium Priority
                      </Badge>
                      <p className="text-2xl font-bold text-yellow-600">4-8 hours</p>
                      <p className="text-sm text-gray-600">Technical issues</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Badge variant="outline" className="mb-2 border-blue-500 text-blue-700">
                        Low Priority
                      </Badge>
                      <p className="text-2xl font-bold text-blue-600">24-48 hours</p>
                      <p className="text-sm text-gray-600">General inquiries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>;
};
export default Support;