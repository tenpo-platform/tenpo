import * as React from "react";
import type { SVGProps } from "react";
const SvgCheese = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Cheese Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M.938 8.973c7.5-7.098 16.406-7.567 16.406-7.567s3.281 2.344 4.218 7.567m-20.624 0v12.59h20.625V8.973m-20.625 0h20.625M.938 16.269a3.75 3.75 0 1 1 5.293 5.294m11.582-7.032a2.344 2.344 0 1 1-4.688 0 2.344 2.344 0 0 1 4.688 0Z"
    />
  </svg>
);
export default SvgCheese;
