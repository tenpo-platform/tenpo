import * as React from "react";
import type { SVGProps } from "react";
const SvgCelery = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Celery Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M11.138 8.298.468 16.406a5.625 5.625 0 0 0 5.626 5.625l8.108-10.668M15 7.5 3.75 18.75M14.384 4.138s2.983-1.657 5.304-1.325c.331 2.32-1.326 5.303-1.326 5.303 2.651 0 3.435 1.728 3.435 1.728l-1.489 1.01a6.236 6.236 0 0 1-8.662-8.662l1.01-1.489s1.728.784 1.728 3.435Z"
    />
  </svg>
);
export default SvgCelery;
