"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from "@relume_io/relume-ui";
import React from "react";

export function Faq3() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-x-12 lg:grid-cols-[.75fr,1fr] lg:gap-x-20">
        <div>
          <h2 className="rb-5 mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
            FAQs
          </h2>
          <p className="md:text-md">
            Find answers to common questions about this missing person's case.
          </p>
          <div className="mt-6 md:mt-8">
            <Button title="Contact" variant="secondary">
              Contact
            </Button>
          </div>
        </div>
        <Accordion type="multiple">
          <AccordionItem value="item-0">
            <AccordionTrigger className="md:py-5 md:text-md">
              How can I help?
            </AccordionTrigger>
            <AccordionContent className="md:pb-6">
              You can assist by sharing this case on social media. Additionally,
              if you have any information, please contact the authorities. Every
              detail can make a difference.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-1">
            <AccordionTrigger className="md:py-5 md:text-md">
              What should I do?
            </AccordionTrigger>
            <AccordionContent className="md:pb-6">
              If you believe you have seen the missing person, please report it
              immediately. Use the contact information provided on this page.
              Your prompt action could help reunite families.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="md:py-5 md:text-md">
              Who can I contact?
            </AccordionTrigger>
            <AccordionContent className="md:pb-6">
              You can contact local law enforcement or the organization managing
              this case. Their contact details are available on the case page.
              Please provide any relevant information you may have.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="md:py-5 md:text-md">
              What is the process?
            </AccordionTrigger>
            <AccordionContent className="md:pb-6">
              The process involves gathering details about the missing person
              and their last known whereabouts. Authorities will then
              investigate and follow leads. Updates will be provided as new
              information emerges.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="md:py-5 md:text-md">
              How to stay updated?
            </AccordionTrigger>
            <AccordionContent className="md:pb-6">
              You can subscribe to notifications for updates on this case.
              Follow us on social media for real-time alerts. Staying informed
              helps keep the community engaged and vigilant.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
