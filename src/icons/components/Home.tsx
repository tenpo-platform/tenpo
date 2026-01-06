import * as React from "react";
import type { SVGProps } from "react";
const SvgHome = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Home Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M7.97 21.188v-4.172c0-1.97 1.312-3.282 3.28-4.266 1.97.984 3.282 2.297 3.282 4.266v4.172M.47 10.313v10.875H22.03V10.313S19.22 3.75 11.25.563C3.281 3.75.469 10.313.469 10.313Z"
    />
  </svg>
);
export default SvgHome;
