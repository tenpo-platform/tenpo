import * as React from "react";
import type { SVGProps } from "react";
const SvgCamera = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Camera Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M2.813 8.438h2.812m16.406-2.813h-4.218l-1.407-2.344S15 2.344 13.125 2.344s-3.281.937-3.281.937L8.438 5.625H.468v12.656s4.22 1.875 10.782 1.875 10.781-1.875 10.781-1.875zm-8.906 10.781a4.219 4.219 0 1 0 0-8.437 4.219 4.219 0 0 0 0 8.437Z"
    />
  </svg>
);
export default SvgCamera;
