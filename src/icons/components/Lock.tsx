import * as React from "react";
import type { SVGProps } from "react";
const SvgLock = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Lock Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M6.094 9.844V1.875S7.969.469 11.25.469s5.156 1.406 5.156 1.406v7.969m-5.156 4.219v3.75m8.906-7.97v10.313s-2.812 1.875-8.906 1.875-8.906-1.875-8.906-1.875V9.844z"
    />
  </svg>
);
export default SvgLock;
