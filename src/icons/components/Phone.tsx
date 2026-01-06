import * as React from "react";
import type { SVGProps } from "react";
const SvgPhone = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Phone Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M9.375 19.219h3.75M8.906.469v2.344h4.688V.469M4.219 21.094V1.406S6.562.47 11.25.47s7.031.937 7.031.937v19.688s-2.343.937-7.031.937-7.031-.937-7.031-.937Z"
    />
  </svg>
);
export default SvgPhone;
