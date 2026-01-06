import * as React from "react";
import type { SVGProps } from "react";
const SvgMail = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Mail Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M22.031 6.094c-5.156 6.094-10.781 7.5-10.781 7.5S5.625 12.188.469 6.094m0-2.578S5.625 2.344 11.25 2.344s10.781 1.172 10.781 1.172v15.703H.47z"
    />
  </svg>
);
export default SvgMail;
