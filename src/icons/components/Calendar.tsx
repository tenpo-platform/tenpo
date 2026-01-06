import * as React from "react";
import type { SVGProps } from "react";
const SvgCalendar = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Calendar Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M5.156 2.344H.47v16.875s3.281 1.875 10.781 1.875 10.781-1.875 10.781-1.875V2.344h-4.687m-1.407 0H6.563M.468 7.03H22.03M17.344 0v4.688M5.156 0v4.688"
    />
  </svg>
);
export default SvgCalendar;
