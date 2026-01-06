import * as React from "react";
import type { SVGProps } from "react";
const SvgRightAngleArrow = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Right Angle Arrow Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M1.406 7.031h9.375c6.213 0 11.25 5.037 11.25 11.25V22.5M1.406 7.031S5.625 5.156 7.031.47M1.406 7.03s4.219 1.875 5.625 6.563"
    />
  </svg>
);
export default SvgRightAngleArrow;
