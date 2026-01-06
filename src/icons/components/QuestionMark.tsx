import * as React from "react";
import type { SVGProps } from "react";
const SvgQuestionMark = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Question Mark Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M11.25 18.281v-1.875m0-1.406v-1.406l2.756-2.756a3.4 3.4 0 0 0 .994-2.4 3.75 3.75 0 1 0-7.228 1.406m13.322-7.031s-4.219-1.407-9.844-1.407-9.844 1.407-9.844 1.407v16.875s4.219 1.406 9.844 1.406 9.844-1.407 9.844-1.407z"
    />
  </svg>
);
export default SvgQuestionMark;
