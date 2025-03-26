"use client";

import { Badge, Button } from "@relume_io/relume-ui";
import React from "react";

export function Portfolio2() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="mb-12 md:mb-18 lg:mb-20">
          <div className="mx-auto max-w-lg text-center">
            <p className="mb-3 font-semibold md:mb-4">Cases</p>
            <h2 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
              Urgent Missing Person Cases
            </h2>
            <p className="md:text-md">
              Discover the latest urgent cases needing your attention.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-12 md:gap-16 lg:gap-20">
          <div>
            <div>
              <a href="#">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                  className="w-full rounded-image object-cover"
                  alt="Relume placeholder image"
                />
              </a>
            </div>
            <div className="mt-5 grid grid-cols-1 items-start justify-between gap-6 md:mt-6 md:grid-cols-2 md:gap-20">
              <div>
                <h3 className="text-xl font-bold md:text-2xl">
                  <a href="#">Missing Child Alert</a>
                </h3>
                <div className="mt-3 flex flex-wrap gap-2 md:mt-4">
                  <Badge>
                    <a href="#">Child Abduction</a>
                  </Badge>
                  <Badge>
                    <a href="#">Urgent Appeal</a>
                  </Badge>
                  <Badge>
                    <a href="#">Community Support</a>
                  </Badge>
                </div>
              </div>
              <div>
                <p>
                  Help us bring missing persons home. Your awareness can make a
                  difference.
                </p>
              </div>
            </div>
          </div>
          <div>
            <div>
              <a href="#">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                  className="w-full rounded-image object-cover"
                  alt="Relume placeholder image"
                />
              </a>
            </div>
            <div className="mt-5 grid grid-cols-1 items-start justify-between gap-6 md:mt-6 md:grid-cols-2 md:gap-20">
              <div>
                <h3 className="text-xl font-bold md:text-2xl">
                  <a href="#">Teen Missing Alert</a>
                </h3>
                <div className="mt-3 flex flex-wrap gap-2 md:mt-4">
                  <Badge>
                    <a href="#">Teen Disappearance</a>
                  </Badge>
                  <Badge>
                    <a href="#">Public Assistance</a>
                  </Badge>
                  <Badge>
                    <a href="#">Missing Person</a>
                  </Badge>
                </div>
              </div>
              <div>
                <p>
                  Stay informed about those who need your help. Together, we can
                  make a change.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 flex justify-center md:mt-18 lg:mt-20">
          <Button title="View all" variant="secondary" size="primary">
            View all
          </Button>
        </div>
      </div>
    </section>
  );
}
