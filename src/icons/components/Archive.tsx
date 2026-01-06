import * as React from "react";
import type { SVGProps } from "react";
const SvgArchive = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Archive Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M7.5 9.844H15m6.094 10.312s-4.219 1.407-9.844 1.407-9.844-1.407-9.844-1.407V6.094h19.688zm.937-17.812S17.411.938 11.25.938.469 2.343.469 2.343v3.75H22.03z"
    />
  </svg>
);
export default SvgArchive;
