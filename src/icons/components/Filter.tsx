import * as React from "react";
import type { SVGProps } from "react";
const SvgFilter = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Filter Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M22.031 3.398S18.75 6.094 11.25 6.094.469 3.398.469 3.398M22.03 7.031s-1.875 3.75-7.968 6.563v5.25c-.938 1.875-3.75 3.187-5.626 3.187v-8.437C2.345 10.78.47 7.03.47 7.03v-3.75S3.75.47 11.25.47 22.031 3.28 22.031 3.28z"
    />
  </svg>
);
export default SvgFilter;
