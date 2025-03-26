"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from "@relume_io/relume-ui";
import React from "react";

export function Faq1() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container max-w-lg">
        <div className="rb-12 mb-12 text-center md:mb-18 lg:mb-20">
          <h2 className="rb-5 mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
            FAQs
          </h2>
          <p className="md:text-md">
            Find answers to your questions about our facial recognition and AI
            search features.
          </p>
        </div>
        <Accordion type="multiple">
          <AccordionItem value="item-0">
            <AccordionTrigger className="md:py-5 md:text-md">
              How does it work?
            </AccordionTrigger>
            <AccordionContent className="md:pb-6">
              Our AI-powered search uses advanced facial recognition technology.
              Users can upload an image to find potential matches. The system
              analyzes facial features and compares them against our database.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-1">
            <AccordionTrigger className="md:py-5 md:text-md">
              Is it secure?
            </AccordionTrigger>
            <AccordionContent className="md:pb-6">
              Yes, we prioritize user privacy and data security. All uploaded
              images are processed securely and are not stored. We comply with
              all relevant regulations to protect your information.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="md:py-5 md:text-md">
              What if I find?
            </AccordionTrigger>
            <AccordionContent className="md:pb-6">
              If you identify a potential match, you can report it through our
              platform. We will review the information and take appropriate
              action. Your assistance could help reunite families.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="md:py-5 md:text-md">
              Can I upload multiple?
            </AccordionTrigger>
            <AccordionContent className="md:pb-6">
              Currently, our system allows only one image upload at a time. This
              ensures accurate matching and analysis. We recommend using the
              clearest image available for best results.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="md:py-5 md:text-md">
              What types of images?
            </AccordionTrigger>
            <AccordionContent className="md:pb-6">
              You can upload any clear image of a person. The image should
              ideally show the face unobstructed. Avoid images with heavy
              shadows or obstructions for optimal matching.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="mx-auto mt-12 max-w-md text-center md:mt-18 lg:mt-20">
          <h4 className="mb-3 text-2xl font-bold md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
            Still have questions?
          </h4>
          <p className="md:text-md">
            Reach out to us anytime for further assistance.
          </p>
          <div className="mt-6 md:mt-8">
            <Button title="Contact" variant="secondary">
              Contact
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
