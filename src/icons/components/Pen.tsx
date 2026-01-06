import * as React from "react";
import type { SVGProps } from "react";
const SvgPen = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Pen Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="m2.344 14.531 4.453 4.453m3.047 3.047H22.5M1.05 21.45c-.581-3.637.892-6.84.892-6.84L16.086.47a5.947 5.947 0 0 1 5.946 5.946L7.89 20.558s-3.202 1.473-6.839.891Z"
    />
  </svg>
);
export default SvgPen;
