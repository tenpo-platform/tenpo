import * as React from "react";
import type { SVGProps } from "react";
const SvgFruit = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Fruit Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M11.25 5.625s1.406-1.875 4.219-1.875c3.281 0 6.094 2.073 6.094 6.563-.938 5.624-4.22 10.312-4.22 10.312s-1.171.938-3.046.938-3.047-.938-3.047-.938-1.172.938-3.047.938-3.047-.938-3.047-.938S1.875 15.938.938 10.313c0-4.49 2.812-6.563 6.093-6.563 2.813 0 4.219 1.875 4.219 1.875Zm0 0A4.69 4.69 0 0 1 15.938.938"
    />
  </svg>
);
export default SvgFruit;
