import * as React from "react";
import type { SVGProps } from "react";
const SvgLeftAngleArrow = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Left Angle Arrow Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M21.094 7.031h-9.375c-6.213 0-11.25 5.037-11.25 11.25V22.5M21.094 7.031S16.875 5.156 15.469.47m5.625 6.562s-4.219 1.875-5.625 6.563"
    />
  </svg>
);
export default SvgLeftAngleArrow;
