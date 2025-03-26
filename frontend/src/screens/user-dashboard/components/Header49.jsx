"use client";

import React from "react";

export function Header49() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="grid grid-cols-1 items-start gap-x-12 gap-y-5 md:grid-cols-2 lg:gap-x-20 lg:gap-y-16">
          <div>
            <h1 className="text-6xl font-bold md:text-9xl lg:text-10xl">
              Welcome to Your Dashboard
            </h1>
          </div>
          <div>
            <p className="md:text-md">
              Here you can manage your reports and stay updated on missing
              person cases. Whether you're a concerned citizen or a law
              enforcement officer, we provide the tools you need to make a
              difference.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
