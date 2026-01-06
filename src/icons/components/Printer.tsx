import * as React from "react";
import type { SVGProps } from "react";
const SvgPrinter = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Printer Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M2.813 16.406H.469V7.031s3.75-.937 10.781-.937 10.781.937 10.781.937v9.375h-2.343m-16.875-3.75h16.875m-14.532 0-1.406 7.5s2.813.938 7.5.938 7.5-.938 7.5-.938l-1.406-7.5M5.156 6.328V2.344s2.344-.938 6.094-.938 6.094.938 6.094.938v3.984"
    />
  </svg>
);
export default SvgPrinter;
