import * as React from "react";
import type { SVGProps } from "react";
const SvgLeftArrowheadChevron = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>
      {"Left Arrowhead Chevron Streamline Icon: https://streamlinehq.com"}
    </desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M18.75.469c-3.75 7.5-15 10.781-15 10.781s11.25 3.281 15 10.781"
    />
  </svg>
);
export default SvgLeftArrowheadChevron;
