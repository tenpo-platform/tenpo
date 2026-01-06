import * as React from "react";
import type { SVGProps } from "react";
const SvgSushi = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Sushi Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="m19.377 12.927 1.248 5.823s-2.812 1.406-9.375 1.406-9.375-1.406-9.375-1.406l1.248-5.823m2.972-1.208c1.405-3.281 5.249-5.625 9.374-5.625m-4.219-.469C3.75 5.625.938 9.609.938 9.609l.468 4.454S4.22 11.25 11.25 11.25s9.844 2.813 9.844 2.813l.468-4.454S18.75 5.625 11.25 5.625Z"
    />
  </svg>
);
export default SvgSushi;
