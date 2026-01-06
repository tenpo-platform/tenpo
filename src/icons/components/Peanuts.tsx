import * as React from "react";
import type { SVGProps } from "react";
const SvgPeanuts = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Peanuts Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="m18.75 4.688-1.875 1.875m1.406 1.406-1.875 1.875m-6.093 8.906 1.874-1.875m-5.156 2.344 1.875-1.875m1.875-1.875 1.875-1.875m7.328-3.454a5.4 5.4 0 0 1-1.519 1.069c-1.374.645-2.872 2.399-3.042 3.907a7.266 7.266 0 1 1-8.04-8.039c1.51-.17 3.263-1.668 3.908-3.041a5.39 5.39 0 1 1 8.693 6.104Z"
    />
  </svg>
);
export default SvgPeanuts;
