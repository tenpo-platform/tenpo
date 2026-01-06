import * as React from "react";
import type { SVGProps } from "react";
const SvgFriedEgg = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Fried Egg Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M11.25 7.5a2.813 2.813 0 0 1 2.813 2.813m2.343 0a5.156 5.156 0 1 1-10.312 0 5.156 5.156 0 0 1 10.312 0ZM11.25.938C5.357.938.938 6.246.938 12.723c0 4.824 3.126 8.84 6.982 8.84 1.418 0 2.738-.53 3.84-1.44.533-.44 1.77-1.49 1.77-1.49h2.61c2.995 0 5.422-3.037 5.422-6.782C21.563 6.337 17.88.938 11.25.938Z"
    />
  </svg>
);
export default SvgFriedEgg;
