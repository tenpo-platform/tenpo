import * as React from "react";
import type { SVGProps } from "react";
const SvgBank = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Bank Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M1.875 19.219h18.75M0 21.094h22.5M18.281 9.375v8.438M8.906 9.375v8.438M4.22 9.375v8.438m9.375-8.438v8.438M11.25 1.172c6.094 2.578 9.844 6.797 9.844 6.797H1.406s3.75-4.219 9.844-6.797Z"
    />
  </svg>
);
export default SvgBank;
