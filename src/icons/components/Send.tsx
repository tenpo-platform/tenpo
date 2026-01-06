import * as React from "react";
import type { SVGProps } from "react";
const SvgSend = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Send Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M6.094 12.188v7.03c2.343-.937 3.75-3.28 3.75-3.28l5.622 5.622.003.003s3.75-7.5 6.097-20.625C10.785 2.117.938 7.03.938 7.03zm0 0 11.718-7.97"
    />
  </svg>
);
export default SvgSend;
