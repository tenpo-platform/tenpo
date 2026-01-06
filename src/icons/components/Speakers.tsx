import * as React from "react";
import type { SVGProps } from "react";
const SvgSpeakers = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Speakers Streamline Icon: https://streamlinehq.com"}</desc>
    <g stroke="currentColor" strokeWidth={1.5}>
      <path d="M1.875 2.813S5.156.469 11.25.469s9.375 2.344 9.375 2.344V22.03H1.875z" />
      <path d="M15.938 14.531a4.688 4.688 0 1 0-9.375 0 4.688 4.688 0 0 0 9.375 0Z" />
      <path d="M13.125 14.531a1.875 1.875 0 1 0-3.75 0 1.875 1.875 0 0 0 3.75 0ZM13.125 5.156a1.875 1.875 0 1 0-3.75 0 1.875 1.875 0 0 0 3.75 0Z" />
    </g>
  </svg>
);
export default SvgSpeakers;
